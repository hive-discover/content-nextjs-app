
import parseMarkdown from "./parseMarkdown";
import HTMLParser from 'node-html-parser'
import base58 from 'base58-encode'

export default function preparePost(post){
    // Parse the post-fields
    post.body = parseMarkdown(post?.body); 
    const parsedHTML = HTMLParser.parse(post.body);

    // Set default values to be inside the post-object
    //   * Images
    if(!post.json_metadata.image)
        post.json_metadata.image = [];

    // Set image-links to through HiveBlog's ImageHosting
    post.json_metadata.image.forEach((url, index) => {
        // Proxy all images directly by the HiveBlog ImageHoster
        // ==> Privacy Policy allows this
        if(url.indexOf("https://images.hive.blog/p/") !== 0)
            url = `https://images.hive.blog/p/${base58(url)}`;

        post.json_metadata.image[index] = url;
    });

    for(const img of parsedHTML.querySelectorAll('img')) {    
        let src = img.attrs.src;
        if(post.json_metadata.image.includes(src))
            continue;

        if(src.indexOf("https://images.hive.blog/p/") !== 0) // Set ImageHoster's url
            src = `https://images.hive.blog/p/${base58(src)}`;

        // Push and replace the src
        post.json_metadata.image.push(src);
        post.body = post.body.replace(img.attrs.src, src);
    }

    // Enforce a Description 
    if (!post.json_metadata.description || post.json_metadata.description.length >= 160){
        // Get first plain text from HTML and set it as description (first 160 chars)
        const plainTextString = parsedHTML.text;
        post.json_metadata.description = plainTextString.length > 160 ? plainTextString.substring(0, 160) + "..." : plainTextString;
    }

    // Calc up/down votes
    post.up_votes = post.active_votes.filter(vote => vote.rshares >= 0).length;
    post.down_votes = post.active_votes.filter(vote => vote.rshares < 0).length;

    return post;
}