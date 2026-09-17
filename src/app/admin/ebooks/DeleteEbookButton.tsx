"use client";
export default function DeleteEbookButton({title}:{title:string}) { return <button type="submit" onClick={(event)=>{if(!confirm(`Supprimer définitivement « ${title} » ?`)) event.preventDefault();}} className="text-red-600">Supprimer</button>; }
