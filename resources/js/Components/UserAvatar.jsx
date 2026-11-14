import { useEffect, useState } from "react";

/**
 * A user's own profile picture. Without one (or if it fails to load), shows the
 * first letter of their name on a neutral background, identical for every role.
 * The picture never depends on the user's role.
 */
export default function UserAvatar({ photoUrl, name, className = "", textClassName = "text-sm" }) {
    const [failed, setFailed] = useState(false);

    useEffect(() => setFailed(false), [photoUrl]);

    if (photoUrl && !failed) {
        return <img src={photoUrl} alt="" onError={() => setFailed(true)} className={`block h-full w-full object-cover ${className}`}/>;
    }

    return (<span aria-hidden="true" className={`flex h-full w-full items-center justify-center bg-[#6d5bd0] font-bold uppercase text-white ${textClassName} ${className}`}>
      {(name ?? "").trim().charAt(0) || "?"}
    </span>);
}
