import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
export async function GET(_: Request,{params}:{params:Promise<{token:string}>}) { const {token}=await params; const order=await prisma.infoEbookOrder.findUnique({where:{downloadToken:token},include:{ebook:true}}); if(!order||order.status!=="PAID"||!order.downloadExpiresAt||order.downloadExpiresAt<new Date())return NextResponse.json({error:"Lien de téléchargement invalide ou expiré."},{status:403}); return NextResponse.redirect(order.ebook.pdfPathname); }
