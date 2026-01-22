import { NextRequest, NextResponse } from 'next/server';
import { createClient } from "@supabase/supabase-js";

// Service Role key - server only
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { name, version, file_url, admin_email } = await req.json();

    // Optional: check admin email
    const ALLOWED_ADMIN_EMAILS = [
      "storagepurpose9090@gmail.com", // Your email - keep this
    ];

    if (!ALLOWED_ADMIN_EMAILS.includes(admin_email)) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid admin email" },
        { status: 401 }
      );
    }

    // Validate
    if (!name || !version || !file_url) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // SIMPLE INSERT - only basic columns
    const { data, error } = await supabaseAdmin
      .from("mods")
      .insert([{ 
        name, 
        version, 
        file_url,
        uploaded_by: admin_email  // Only this extra field
      }])
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: `Database error: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Mod uploaded successfully!",
      data
    });

  } catch (err: any) {
    console.error("Server error:", err);
    return NextResponse.json(
      { error: `Server error: ${err.message}` },
      { status: 500 }
    );
  }
}

// Keep the GET method as is - it should work
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("mods")
      .select("*")
      .order("created_at", { ascending: false }); // Changed to created_at

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ mods: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}