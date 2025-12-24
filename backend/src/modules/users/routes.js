import { supabase } from '../../config/supabase.js';
import { verifySupabaseJWT } from '../../config/supabaseAuth.js';

export async function usersRoutes(fastify) {
  // Middleware untuk authenticate
  fastify.addHook('preHandler', async (request, reply) => {
    // Skip untuk OPTIONS request
    if (request.method === 'OPTIONS') return;

    try {
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return reply.code(401).send({ error: 'No token provided' });
      }
      
      const token = authHeader.split(' ')[1];
      const user = await verifySupabaseJWT(token);
      request.user = user;
    } catch (error) {
      fastify.log.error('Auth error:', error.message);
      return reply.code(401).send({ error: 'Invalid token' });
    }
  });

  // Get all users (admin only)
  fastify.get('/users', async (request, reply) => {
    try {
      // Cek role dari database
      const { data: currentUser, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', request.user.sub)
        .single();

      if (userError || !currentUser) {
        fastify.log.error('User lookup error:', userError);
        return reply.code(401).send({ error: 'User not found' });
      }

      if (currentUser.role !== 'admin') {
        return reply.code(403).send({ error: 'Admin access required' });
      }

      // Fetch semua users menggunakan service role (bypass RLS)
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { users: data };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to fetch users' });
    }
  });

  // Update user role (admin only)
  fastify.patch('/users/:userId/role', async (request, reply) => {
    try {
      const { userId } = request.params;
      const { newRole } = request.body;

      // Cek role dari database
      const { data: currentUser, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', request.user.sub)
        .single();

      if (userError || !currentUser) {
        return reply.code(401).send({ error: 'User not found' });
      }

      if (currentUser.role !== 'admin') {
        return reply.code(403).send({ error: 'Admin access required' });
      }

      const { data, error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return { user: data, message: 'Role updated successfully' };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to update role' });
    }
  });

  // Delete user (admin only)
  fastify.delete('/users/:userId', async (request, reply) => {
    try {
      const { userId } = request.params;

      // Cek role dari database
      const { data: currentUser, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', request.user.sub)
        .single();

      if (userError || !currentUser) {
        return reply.code(401).send({ error: 'User not found' });
      }

      if (currentUser.role !== 'admin') {
        return reply.code(403).send({ error: 'Admin access required' });
      }

      // Prevent self-delete
      if (userId === request.user.sub) {
        return reply.code(400).send({ error: 'Cannot delete yourself' });
      }

      const { error } = await supabase.from('users').delete().eq('id', userId);

      if (error) throw error;
      return { message: 'User deleted successfully' };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to delete user' });
    }
  });
}