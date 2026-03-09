import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/** Cria usuário no Auth e em config_usuarios. Requer SUPABASE_SERVICE_ROLE_KEY. */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, nome, perfilId, profissionalId } = body as {
      email?: string;
      password?: string;
      nome?: string;
      perfilId?: string | null;
      profissionalId?: string | null;
    };
    if (!email?.trim() || !password?.trim() || !nome?.trim()) {
      return NextResponse.json(
        { error: "email, password e nome são obrigatórios" },
        { status: 400 }
      );
    }
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) {
      return NextResponse.json(
        { error: "SUPABASE_SERVICE_ROLE_KEY não configurada" },
        { status: 500 }
      );
    }
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceKey,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email.trim(),
      password: password.trim(),
      email_confirm: true,
    });
    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }
    const uid = authUser.user?.id;
    if (!uid) {
      return NextResponse.json({ error: "Usuário criado sem id" }, { status: 500 });
    }
    const { data: emp } = await supabaseAdmin.from("config_empresa").select("id").limit(1).single();
    if (!emp?.id) {
      return NextResponse.json({ error: "Nenhuma empresa configurada" }, { status: 500 });
    }
    const insert: Record<string, unknown> = {
      auth_uid: uid,
      empresa_id: emp.id,
      nome: nome.trim(),
      email: email.trim(),
      perfil_id: perfilId || null,
      ativo: true,
    };
    if (profissionalId) insert.profissional_id = profissionalId;
    const { error: configError } = await supabaseAdmin
      .from("config_usuarios")
      .insert(insert);
    if (configError) {
      return NextResponse.json(
        { error: "Usuário criado no Auth, mas falha ao criar em config_usuarios: " + configError.message },
        { status: 500 }
      );
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erro interno" },
      { status: 500 }
    );
  }
}
