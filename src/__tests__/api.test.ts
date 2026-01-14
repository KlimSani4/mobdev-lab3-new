import { getTasks, getTaskById, createTask } from '../api/tasks';
import { getCurrentUserProfile, updateUserProfile } from '../api/users';

describe('Tasks API', () => {
  it('getTasks returns array', async () => {
    const tasks = await getTasks();
    expect(Array.isArray(tasks)).toBe(true);
  });

  it('getTasks returns tasks with required fields', async () => {
    const tasks = await getTasks();
    if (tasks.length > 0) {
      const task = tasks[0];
      expect(task).toHaveProperty('id');
      expect(task).toHaveProperty('title');
      expect(task).toHaveProperty('description');
      expect(task).toHaveProperty('category');
      expect(task).toHaveProperty('status');
    }
  });

  it('getTaskById returns task', async () => {
    const tasks = await getTasks();
    if (tasks.length > 0) {
      const task = await getTaskById(tasks[0].id);
      expect(task.id).toBe(tasks[0].id);
    }
  });

  it('getTaskById throws for invalid id', async () => {
    await expect(getTaskById('invalid-id')).rejects.toThrow();
  });

  it('createTask creates new task', async () => {
    const newTask = await createTask({
      title: 'Test Task',
      description: 'Test Description',
      category: 'other',
    });
    expect(newTask.title).toBe('Test Task');
    expect(newTask.status).toBe('open');
  });
});

describe('Users API', () => {
  it('getCurrentUserProfile returns user', async () => {
    const profile = await getCurrentUserProfile();
    expect(profile).toHaveProperty('id');
    expect(profile).toHaveProperty('name');
    expect(profile).toHaveProperty('karma');
    expect(profile).toHaveProperty('level');
  });

  it('updateUserProfile updates user', async () => {
    const updated = await updateUserProfile({ name: 'New Name' });
    expect(updated.name).toBe('New Name');
  });
});
