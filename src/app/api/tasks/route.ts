import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { tasks, projects, teamMembers } from '@/db/schema';
import { eq, like, and, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Single task by ID
    if (id) {
      if (isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const task = await db
        .select()
        .from(tasks)
        .where(eq(tasks.id, parseInt(id)))
        .limit(1);

      if (task.length === 0) {
        return NextResponse.json(
          { error: 'Task not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(task[0], { status: 200 });
    }

    // List tasks with pagination and filters
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');
    const projectId = searchParams.get('projectId');
    const status = searchParams.get('status');
    const assignedTo = searchParams.get('assignedTo');

    let query = db.select().from(tasks);

    // Build filter conditions
    const conditions = [];

    if (search) {
      conditions.push(like(tasks.name, `%${search}%`));
    }

    if (projectId) {
      if (isNaN(parseInt(projectId))) {
        return NextResponse.json(
          { error: 'Valid projectId is required', code: 'INVALID_PROJECT_ID' },
          { status: 400 }
        );
      }
      conditions.push(eq(tasks.projectId, parseInt(projectId)));
    }

    if (status) {
      if (status !== 'incomplete' && status !== 'complete') {
        return NextResponse.json(
          { error: 'Status must be either "incomplete" or "complete"', code: 'INVALID_STATUS' },
          { status: 400 }
        );
      }
      conditions.push(eq(tasks.status, status));
    }

    if (assignedTo) {
      if (isNaN(parseInt(assignedTo))) {
        return NextResponse.json(
          { error: 'Valid assignedTo is required', code: 'INVALID_ASSIGNED_TO' },
          { status: 400 }
        );
      }
      conditions.push(eq(tasks.assignedTo, parseInt(assignedTo)));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query
      .orderBy(desc(tasks.createdAt))
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
    const { projectId, name, status, assignedTo } = body;

    // Validate required fields
    if (!projectId) {
      return NextResponse.json(
        { error: 'projectId is required', code: 'MISSING_PROJECT_ID' },
        { status: 400 }
      );
    }

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'name is required', code: 'MISSING_NAME' },
        { status: 400 }
      );
    }

    // Validate projectId is a number
    if (isNaN(parseInt(projectId))) {
      return NextResponse.json(
        { error: 'projectId must be a valid number', code: 'INVALID_PROJECT_ID' },
        { status: 400 }
      );
    }

    // Verify project exists
    const project = await db
      .select()
      .from(projects)
      .where(eq(projects.id, parseInt(projectId)))
      .limit(1);

    if (project.length === 0) {
      return NextResponse.json(
        { error: 'Project not found', code: 'PROJECT_NOT_FOUND' },
        { status: 400 }
      );
    }

    // Validate status if provided
    if (status && status !== 'incomplete' && status !== 'complete') {
      return NextResponse.json(
        { error: 'Status must be either "incomplete" or "complete"', code: 'INVALID_STATUS' },
        { status: 400 }
      );
    }

    // Validate assignedTo if provided
    if (assignedTo !== undefined && assignedTo !== null) {
      if (isNaN(parseInt(assignedTo))) {
        return NextResponse.json(
          { error: 'assignedTo must be a valid number', code: 'INVALID_ASSIGNED_TO' },
          { status: 400 }
        );
      }

      const teamMember = await db
        .select()
        .from(teamMembers)
        .where(eq(teamMembers.id, parseInt(assignedTo)))
        .limit(1);

      if (teamMember.length === 0) {
        return NextResponse.json(
          { error: 'Team member not found', code: 'TEAM_MEMBER_NOT_FOUND' },
          { status: 400 }
        );
      }
    }

    // Prepare insert data
    const now = new Date().toISOString();
    const insertData: any = {
      projectId: parseInt(projectId),
      name: name.trim(),
      status: status || 'incomplete',
      createdAt: now,
      updatedAt: now,
    };

    if (assignedTo !== undefined && assignedTo !== null) {
      insertData.assignedTo = parseInt(assignedTo);
    }

    const newTask = await db.insert(tasks).values(insertData).returning();

    return NextResponse.json(newTask[0], { status: 201 });
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
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if task exists
    const existingTask = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, parseInt(id)))
      .limit(1);

    if (existingTask.length === 0) {
      return NextResponse.json(
        { error: 'Task not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, status, assignedTo, projectId } = body;

    // Validate status if provided
    if (status !== undefined && status !== 'incomplete' && status !== 'complete') {
      return NextResponse.json(
        { error: 'Status must be either "incomplete" or "complete"', code: 'INVALID_STATUS' },
        { status: 400 }
      );
    }

    // Validate projectId if provided
    if (projectId !== undefined) {
      if (isNaN(parseInt(projectId))) {
        return NextResponse.json(
          { error: 'projectId must be a valid number', code: 'INVALID_PROJECT_ID' },
          { status: 400 }
        );
      }

      const project = await db
        .select()
        .from(projects)
        .where(eq(projects.id, parseInt(projectId)))
        .limit(1);

      if (project.length === 0) {
        return NextResponse.json(
          { error: 'Project not found', code: 'PROJECT_NOT_FOUND' },
          { status: 400 }
        );
      }
    }

    // Validate assignedTo if provided
    if (assignedTo !== undefined && assignedTo !== null) {
      if (isNaN(parseInt(assignedTo))) {
        return NextResponse.json(
          { error: 'assignedTo must be a valid number', code: 'INVALID_ASSIGNED_TO' },
          { status: 400 }
        );
      }

      const teamMember = await db
        .select()
        .from(teamMembers)
        .where(eq(teamMembers.id, parseInt(assignedTo)))
        .limit(1);

      if (teamMember.length === 0) {
        return NextResponse.json(
          { error: 'Team member not found', code: 'TEAM_MEMBER_NOT_FOUND' },
          { status: 400 }
        );
      }
    }

    // Prepare update data - only include fields that are being updated
    const now = new Date().toISOString();
    const updateData: Record<string, any> = {
      updatedAt: now,
    };

    if (name !== undefined) {
      if (name.trim() === '') {
        return NextResponse.json(
          { error: 'name cannot be empty', code: 'INVALID_NAME' },
          { status: 400 }
        );
      }
      updateData.name = name.trim();
    }

    if (status !== undefined) {
      updateData.status = status;
    }

    if (assignedTo !== undefined) {
      updateData.assignedTo = assignedTo === null ? null : parseInt(assignedTo);
    }

    if (projectId !== undefined) {
      updateData.projectId = parseInt(projectId);
    }

    // Update and return in one operation
    const updated = await db
      .update(tasks)
      .set(updateData)
      .where(eq(tasks.id, parseInt(id)))
      .returning();

    if (!updated || updated.length === 0) {
      return NextResponse.json(
        { error: 'Failed to update task', code: 'UPDATE_FAILED' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(updated[0], { status: 200 });
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
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if task exists
    const existingTask = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, parseInt(id)))
      .limit(1);

    if (existingTask.length === 0) {
      return NextResponse.json(
        { error: 'Task not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const deleted = await db
      .delete(tasks)
      .where(eq(tasks.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: 'Task deleted successfully',
        task: deleted[0],
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