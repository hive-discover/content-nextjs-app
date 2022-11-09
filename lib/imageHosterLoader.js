

export default function myLoader({src, width, height, quality}){
    if(src.indexOf("?") === -1)
        src += "?place=holder";

    if(src.indexOf("width=") === -1 && width)
        src += "&width=" + width;
    if(src.indexOf("height=") === -1 && height)
        src += "&height=" + height;
    if(src.indexOf("quality=") === -1 && quality)
        src += "&quality=" + quality;

    return src + "&mode=fit";
}