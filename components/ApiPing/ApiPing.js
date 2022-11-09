
import { useEffect } from 'react';
import {useRouter } from 'next/router';

async function ping(){
    await fetch("https://api.hive-discover.tech")
        .then(response => response.json())
        .then(data => new Promise((resolve, reject) => {data.status === "ok" ? resolve(true) : reject(data.status);}))
        .catch(async (err) => {
            // API is not available
            // ==> Load Notify and message the User
            console.error("Error on Ping our API ", err);
            const {Notify} = await import('notiflix/build/notiflix-notify-aio');
            Notify.failure(`Cannot connect to our API`, {timeout: 5000, position : "right-bottom", clickToClose : true, passOnHover : true});
        });
}

export default function pingComponent(){       
    const router = useRouter();

    // Ping our API at first render
    useEffect(() => {
        ping();
    }, [router]);

    // Show nothing
    return null;
}