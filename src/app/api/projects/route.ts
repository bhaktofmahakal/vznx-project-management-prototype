import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { projects } from '@/db/schema';
import { eq, like, or, desc, and } from 'drizzle-orm';

const VALID_STATUSES = ['In Progress', 'Completed', 'Planning'] as const;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Single record fetch by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { 
            error: 'Valid ID is required',
            code: 'INVALID_ID' 
          },
          { status: 400 }
        );
      }

      const project = await db.select()
        .from(projects)
        .where(eq(projects.id, parseInt(id)))
        .limit(1);

      if (project.length === 0) {
        return NextResponse.json(
          { 
            error: 'Project not found',
            code: 'PROJECT_NOT_FOUND' 
          },
          { status: 404 }
        );
      }

      return NextResponse.json(project[0], { status: 200 });
    }

    // List with pagination, search, and filtering
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');
    const status = searchParams.get('status');

    let query = db.select().from(projects);

    // Build where conditions
    const conditions = [];

    if (search) {
      conditions.push(
        or(
          like(projects.name, `%${search}%`),
          like(projects.description, `%${search}%`)
        )
      );
    }

    if (status) {
      conditions.push(eq(projects.status, status));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query
      .orderBy(desc(projects.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, status, progress, description } = body;

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json(
        { 
          error: 'Name is required and must not be empty',
          code: 'MISSING_REQUIRED_FIELD' 
        },
        { status: 400 }
      );
    }

    // Validate progress if provided
    if (progress !== undefined && progress !== null) {
      const progressNum = parseInt(progress);
      if (isNaN(progressNum) || progressNum < 0 || progressNum > 100) {
        return NextResponse.json(
          { 
            error: 'Progress must be between 0 and 100',
            code: 'INVALID_PROGRESS' 
          },
          { status: 400 }
        );
      }
    }

    // Validate status if provided
    if (status && !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { 
          error: 'Status must be one of: In Progress, Completed, Planning',
          code: 'INVALID_STATUS' 
        },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    const newProject = await db.insert(projects)
      .values({
        name: name.trim(),
        status: status || 'Planning',
        progress: progress !== undefined && progress !== null ? parseInt(progress) : 0,
        description: description ? description.trim() : null,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return NextResponse.json(newProject[0], { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { 
          error: 'Valid ID is required',
          code: 'INVALID_ID' 
        },
        { status: 400 }
      );
    }

    // Check if record exists
    const existingProject = await db.select()
      .from(projects)
      .where(eq(projects.id, parseInt(id)))
      .limit(1);

    if (existingProject.length === 0) {
      return NextResponse.json(
        { 
          error: 'Project not found',
          code: 'PROJECT_NOT_FOUND' 
        },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, status, progress, description } = body;

    // Validate name if provided
    if (name !== undefined && (typeof name !== 'string' || name.trim() === '')) {
      return NextResponse.json(
        { 
          error: 'Name must not be empty',
          code: 'INVALID_NAME' 
        },
        { status: 400 }
      );
    }

    // Validate progress if provided
    if (progress !== undefined && progress !== null) {
      const progressNum = parseInt(progress);
      if (isNaN(progressNum) || progressNum < 0 || progressNum > 100) {
        return NextResponse.json(
          { 
            error: 'Progress must be between 0 and 100',
            code: 'INVALID_PROGRESS' 
          },
          { status: 400 }
      );
      }
    }

    // Validate status if provided
    if (status && !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { 
          error: 'Status must be one of: In Progress, Completed, Planning',
          code: 'INVALID_STATUS' 
        },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const updates: Record<string, any> = {
      updatedAt: now,
    };

    if (name !== undefined) updates.name = name.trim();
    if (status !== undefined) updates.status = status;
    if (progress !== undefined && progress !== null) updates.progress = parseInt(progress);
    if (description !== undefined) updates.description = description ? description.trim() : null;

    const updatedProject = await db.update(projects)
      .set(updates)
      .where(eq(projects.id, parseInt(id)))
      .returning();

    return NextResponse.json(updatedProject[0], { status: 200 });

  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { 
          error: 'Valid ID is required',
          code: 'INVALID_ID' 
        },
        { status: 400 }
      );
    }

    // Check if record exists
    const existingProject = await db.select()
      .from(projects)
      .where(eq(projects.id, parseInt(id)))
      .limit(1);

    if (existingProject.length === 0) {
      return NextResponse.json(
        { 
          error: 'Project not found',
          code: 'PROJECT_NOT_FOUND' 
        },
        { status: 404 }
      );
    }

    const deletedProject = await db.delete(projects)
      .where(eq(projects.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: 'Project deleted successfully',
        project: deletedProject[0]
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}