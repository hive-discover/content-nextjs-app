

export default function myLoader({src, width, quality}){
    if(src.indexOf("?") === -1)
        src += "?place=holder";

    if(src.indexOf("width=") === -1)
        src += "&width=" + width;
    if(src.indexOf("quality=") === -1)
        src += "&quality=" + quality;

    return src ;
}