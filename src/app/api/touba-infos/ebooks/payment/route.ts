import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { paydunyaHeaders, paydunyaUrl, publicOrigin, SENEGAL_PHONE } from "@/lib/touba-infos-ebooks";
export async function POST(request: Request) {
 try { const {slug,name,email,phone,method}=await request.json();
  if(!name?.trim()||!/^\S+@\S+\.\S+$/.test(email)||!SENEGAL_PHONE.test(phone)||!["WAVE","ORANGE_MONEY"].includes(method)) return NextResponse.json({error:"Informations de paiement invalides."},{status:400});
  const ebook=await prisma.infoEbook.findFirst({where:{slug,status:"PUBLISHED",kind:"PAID"}}); if(!ebook||ebook.priceXof<1)return NextResponse.json({error:"Ebook indisponible."},{status:404});
  const order=await prisma.infoEbookOrder.create({data:{ebookId:ebook.id,customerName:name.trim(),customerEmail:email.toLowerCase(),customerPhone:phone,amountXof:ebook.priceXof,paymentMethod:method}});
  const origin=publicOrigin(request); const payload={invoice:{total_amount:ebook.priceXof,description:`Ebook: ${ebook.title}`},store:{name:"Touba Infos",tagline:"Bibliothèque numérique"},actions:{cancel_url:`${origin}/touba-infos/ebooks/${ebook.slug}`,return_url:`${origin}/touba-infos/ebooks/${ebook.slug}?commande=${order.id}`,callback_url:`${origin}/api/touba-infos/ebooks/ipn`},custom_data:{order_id:order.id,payment_method:method},channels:[method]};
  const response=await fetch(paydunyaUrl("/api/v1/checkout-invoice/create"),{method:"POST",headers:paydunyaHeaders(),body:JSON.stringify(payload)}); const data=await response.json();
  if(!response.ok||data.response_code!="00") { await prisma.infoEbookOrder.update({where:{id:order.id},data:{status:"FAILED"}}); return NextResponse.json({error:"Initialisation PayDunya impossible."},{status:502}); }
  await prisma.infoEbookOrder.update({where:{id:order.id},data:{paydunyaToken:data.token}}); return NextResponse.json({checkoutUrl:data.response_text,orderId:order.id});
 } catch { return NextResponse.json({error:"Service de paiement indisponible."},{status:500}); }
}
