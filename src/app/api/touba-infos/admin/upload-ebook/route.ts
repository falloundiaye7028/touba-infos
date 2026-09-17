import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/touba-infos-admin";
export async function POST(request: Request) {
 if (!(await isAuthed())) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
 const file=(await request.formData()).get("ebook");
 if (!(file instanceof File)||file.type!=="application/pdf"||file.size>25*1024*1024) return NextResponse.json({error:"PDF requis (25 Mo maximum)."},{status:400});
 const name=file.name.replace(/[^a-zA-Z0-9.-]+/g,"-").slice(-100);
 const blob=await put(`touba-infos/ebooks/${name}`,file,{access:"public",addRandomSuffix:true,contentType:"application/pdf"});
 return NextResponse.json({url:blob.url,pathname:blob.pathname});
}
