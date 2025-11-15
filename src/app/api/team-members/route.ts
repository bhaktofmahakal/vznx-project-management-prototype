import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { teamMembers, tasks } from '@/db/schema';
import { eq, like, or, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single team member by ID with task count
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const result = await db
        .select({
          id: teamMembers.id,
          name: teamMembers.name,
          email: teamMembers.email,
          role: teamMembers.role,
          createdAt: teamMembers.createdAt,
          taskCount: sql<number>`COUNT(${tasks.id})`.as('taskCount'),
        })
        .from(teamMembers)
        .leftJoin(tasks, eq(teamMembers.id, tasks.assignedTo))
        .where(eq(teamMembers.id, parseInt(id)))
        .groupBy(teamMembers.id);

      if (result.length === 0) {
        return NextResponse.json({ 
          error: 'Team member not found',
          code: 'NOT_FOUND' 
        }, { status: 404 });
      }

      return NextResponse.json(result[0]);
    }

    // List all team members with pagination and search
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');
    const includeTaskCount = searchParams.get('includeTaskCount') === 'true';

    if (includeTaskCount) {
      // Query with task count
      let query = db
        .select({
          id: teamMembers.id,
          name: teamMembers.name,
          email: teamMembers.email,
          role: teamMembers.role,
          createdAt: teamMembers.createdAt,
          taskCount: sql<number>`COUNT(${tasks.id})`.as('taskCount'),
        })
        .from(teamMembers)
        .leftJoin(tasks, eq(teamMembers.id, tasks.assignedTo))
        .groupBy(teamMembers.id)
        .$dynamic();

      if (search) {
        query = query.where(
          or(
            like(teamMembers.name, `%${search}%`),
            like(teamMembers.email, `%${search}%`)
          )
        );
      }

      const results = await query.limit(limit).offset(offset);
      return NextResponse.json(results);
    } else {
      // Query without task count
      let query = db.select().from(teamMembers).$dynamic();

      if (search) {
        query = query.where(
          or(
            like(teamMembers.name, `%${search}%`),
            like(teamMembers.email, `%${search}%`)
          )
        );
      }

      const results = await query.limit(limit).offset(offset);
      return NextResponse.json(results);
    }
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, role } = body;

    // Validate required fields
    if (!name || name.trim() === '') {
      return NextResponse.json({ 
        error: "Name is required",
        code: "MISSING_NAME" 
      }, { status: 400 });
    }

    if (!email || email.trim() === '') {
      return NextResponse.json({ 
        error: "Email is required",
        code: "MISSING_EMAIL" 
      }, { status: 400 });
    }

    // Validate email format
    if (!email.includes('@')) {
      return NextResponse.json({ 
        error: "Invalid email format",
        code: "INVALID_EMAIL" 
      }, { status: 400 });
    }

    // Sanitize inputs
    const sanitizedEmail = email.toLowerCase().trim();
    const sanitizedName = name.trim();

    try {
      const newTeamMember = await db.insert(teamMembers)
        .values({
          name: sanitizedName,
          email: sanitizedEmail,
          role: role || null,
          createdAt: new Date().toISOString(),
        })
        .returning();

      return NextResponse.json(newTeamMember[0], { status: 201 });
    } catch (dbError) {
      // Handle unique constraint violation for email
      if ((dbError as Error).message.includes('UNIQUE constraint failed')) {
        return NextResponse.json({ 
          error: "Email already exists",
          code: "DUPLICATE_EMAIL" 
        }, { status: 400 });
      }
      throw dbError;
    }
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check if team member exists
    const existing = await db.select()
      .from(teamMembers)
      .where(eq(teamMembers.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ 
        error: 'Team member not found',
        code: 'NOT_FOUND' 
      }, { status: 404 });
    }

    const body = await request.json();
    const { name, email, role } = body;

    const updates: Record<string, any> = {};

    if (name !== undefined) {
      if (name.trim() === '') {
        return NextResponse.json({ 
          error: "Name cannot be empty",
          code: "INVALID_NAME" 
        }, { status: 400 });
      }
      updates.name = name.trim();
    }

    if (email !== undefined) {
      if (email.trim() === '') {
        return NextResponse.json({ 
          error: "Email cannot be empty",
          code: "INVALID_EMAIL" 
        }, { status: 400 });
      }
      // Validate email format
      if (!email.includes('@')) {
        return NextResponse.json({ 
          error: "Invalid email format",
          code: "INVALID_EMAIL" 
        }, { status: 400 });
      }
      updates.email = email.toLowerCase().trim();
    }

    if (role !== undefined) {
      updates.role = role;
    }

    try {
      // Update and return in one operation
      const updated = await db.update(teamMembers)
        .set(updates)
        .where(eq(teamMembers.id, parseInt(id)))
        .returning();

      if (!updated || updated.length === 0) {
        return NextResponse.json({ 
          error: 'Failed to update team member',
          code: 'UPDATE_FAILED' 
        }, { status: 500 });
      }
      
      return NextResponse.json(updated[0]);
    } catch (dbError) {
      // Handle unique constraint violation for email
      if ((dbError as Error).message.includes('UNIQUE constraint failed')) {
        return NextResponse.json({ 
          error: "Email already exists",
          code: "DUPLICATE_EMAIL" 
        }, { status: 400 });
      }
      throw dbError;
    }
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const deleted = await db.delete(teamMembers)
      .where(eq(teamMembers.id, parseInt(id)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ 
        error: 'Team member not found',
        code: 'NOT_FOUND' 
      }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Team member deleted successfully',
      deletedMember: deleted[0]
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}