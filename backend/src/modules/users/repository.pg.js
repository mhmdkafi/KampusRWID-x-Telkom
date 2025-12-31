import { supabase } from "../../config/supabase.js";

export class PgUsersRepository {
  async findById(userId) {
    const { data, error } = await supabase
      .from("users")
      .select("id, email, full_name, role, created_at, updated_at")
      .eq("id", userId)
      .maybeSingle();

    if (error && error.code !== "PGRST116") {
      throw new Error(`Failed to find user: ${error.message}`);
    }

    return data || null;
  }

  async listAll() {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw new Error(`Failed to list users: ${error.message}`);
    return data || [];
  }

  async create(userData) {
    const { data, error } = await supabase
      .from("users")
      .insert([userData])
      .select()
      .single();

    if (error) throw new Error(`Failed to create user: ${error.message}`);
    return data;
  }

  async updateRole(userId, role) {
    const { error } = await supabase
      .from("users")
      .update({ role, updated_at: new Date().toISOString() })
      .eq("id", userId);

    if (error) throw new Error(`Failed to update user role: ${error.message}`);
  }

  async delete(userId) {
    const { error } = await supabase.from("users").delete().eq("id", userId);

    if (error) throw new Error(`Failed to delete user: ${error.message}`);
  }
}
