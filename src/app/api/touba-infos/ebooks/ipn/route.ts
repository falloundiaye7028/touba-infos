import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { newDownloadToken, paydunyaHeaders, paydunyaUrl } from "@/lib/touba-infos-ebooks";
export async function POST(request: Request) { try { const body=await request.json(); const token=body?.data?.token || body?.token; if(!token)return NextResponse.json({error:"Token manquant"},{status:400});
 const order=await prisma.infoEbookOrder.findUnique({where:{paydunyaToken:token},include:{ebook:true}}); if(!order)return NextResponse.json({error:"Commande inconnue"},{status:404}); if(order.status==="PAID")return NextResponse.json({ok:true});
 const response=await fetch(paydunyaUrl(`/api/v1/checkout-invoice/confirm/${encodeURIComponent(token)}`),{headers:paydunyaHeaders()}); const data=await response.json(); const paid=data?.status==="completed" || data?.data?.status==="completed"; const amount=Number(data?.invoice?.total_amount ?? data?.data?.invoice?.total_amount);
 if(!paid||amount!==order.amountXof||order.ebook.priceXof!==order.amountXof) return NextResponse.json({error:"Paiement non confirmé"},{status:400});
 const updated = await prisma.infoEbookOrder.updateMany({where:{id:order.id,status:"PENDING"},data:{status:"PAID",paydunyaRef:String(data?.receipt_url??data?.transaction_id??token),paidAt:new Date(),downloadToken:newDownloadToken(),downloadExpiresAt:new Date(Date.now()+1000*60*60*24)}}); return NextResponse.json({ok:true, duplicate:updated.count===0});
 } catch { return NextResponse.json({error:"IPN invalide"},{status:400}); } }
