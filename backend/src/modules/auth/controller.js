import { PgUsersRepository } from "../users/repository.pg.js";
import { supabase } from "../../config/supabase.js";

const usersRepo = new PgUsersRepository();

export const me = async (request) => {
  const userId = request.user?.sub;
  const user = await usersRepo.findById(userId);

  return {
    user: {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
    },
  };
};

export const resetPassword = async (request, reply) => {
  try {
    const { email, fullName, newPassword } = request.body;

    if (!email || !fullName || !newPassword) {
      return reply.code(400).send({
        error: "Email, nama lengkap, dan password baru harus diisi",
      });
    }

    if (newPassword.length < 6) {
      return reply.code(400).send({
        error: "Password minimal 6 karakter",
      });
    }

    // Verifikasi user exists dengan email dan full_name
    const { data: authUser, error: getUserError } =
      await supabase.auth.admin.listUsers();

    if (getUserError) {
      throw getUserError;
    }

    // Cari user yang match dengan email
    const matchingUser = authUser.users.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    );

    if (!matchingUser) {
      return reply.code(404).send({
        error: "Email tidak terdaftar",
      });
    }

    // Verifikasi full_name dari user_metadata
    const userFullName = matchingUser.user_metadata?.full_name || "";

    if (userFullName.toLowerCase().trim() !== fullName.toLowerCase().trim()) {
      return reply.code(401).send({
        error: "Nama lengkap tidak cocok dengan data yang terdaftar",
      });
    }

    // Update password menggunakan Admin API
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      matchingUser.id,
      { password: newPassword }
    );

    if (updateError) {
      throw updateError;
    }

    request.log.info(
      { userId: matchingUser.id, email },
      "Password reset successfully"
    );

    return {
      message: "Password berhasil diubah",
    };
  } catch (error) {
    request.log.error({ error }, "Reset password error");
    return reply.code(500).send({
      error: "Gagal reset password: " + error.message,
    });
  }
};
