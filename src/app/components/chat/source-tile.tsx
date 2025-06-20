import Image from "next/image"
import { useState } from "react"

export const SourceTile = ({ chunk_text, record_name, source, url }:
  { chunk_text: string, record_name: string, source: string, url: string }) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className='relative flex items-center space-x-2 w-1/2 p-3 rounded-md border border-slate-300 dark:border-slate-700'
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Image width={32} height={22}
        src={source === "googledrive" ? "/google-drive-logo.png" :
          source === "box" ? "/box-logo.webp" : "/dropbox-logo.png"} alt="logo" />
      <a href={url} target="_blank" className=" text-sm overflow-hidden whitespace-nowrap text-ellipsis">{record_name}</a>

      {isHovered && (
        <div className="absolute z-10 bottom-full left-0 mb-2 p-3 bg-white dark:bg-gray-800 border border-slate-300 dark:border-slate-700 rounded-md shadow-lg max-w-md w-max">
          <p className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{chunk_text}</p>
          <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-white dark:border-t-gray-800"></div>
        </div>
      )}
    </div>
  )
}
