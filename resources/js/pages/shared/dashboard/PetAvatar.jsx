import { useState } from "react";

export function PetAvatar({ name, photo, size = "md", }) {
    // Remember which URL failed so a new photo URL gets a fresh attempt.
    const [failedPhoto, setFailedPhoto] = useState(null);
    const dim = size === "sm" ? "w-10 h-10" : size === "lg" ? "w-16 h-16" : "w-14 h-14";
    const colors = [
        "bg-amber-300",
        "bg-teal-300",
        "bg-rose-300",
        "bg-sky-300",
        "bg-violet-300",
        "bg-lime-300",
    ];
    const bg = colors[name.charCodeAt(0) % colors.length];
    if (photo && photo !== failedPhoto) {
        return (<div className={`${dim} rounded-full overflow-hidden flex-shrink-0`}>
        <img src={photo} alt={name} onError={() => setFailedPhoto(photo)} className="w-full h-full object-cover"/>
      </div>);
    }
    return (<div className={`${dim} rounded-full ${bg} flex items-center justify-center flex-shrink-0 text-white font-bold text-sm`}>
      {name[0]}
    </div>);
}
