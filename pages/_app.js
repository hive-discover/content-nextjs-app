import { useState, useEffect, Fragment } from 'react'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'

import Head from 'next/head'
import { SessionProvider } from "next-auth/react"

import {ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline';
import { Provider } from 'react-redux'

import {store} from '../redux/store'
import Layout from '../components/Layout/Layout'
const ApiPing = dynamic(() => import('../components/ApiPing/ApiPing'));
const DefaultLoader = dynamic(() => import('../components/Loading/DefaultLoader'));

// Fonts
//  * Roboto
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

// Own Styles
import theme from '../theme'
import '../styles/globals.css'

function MyApp({ Component, pageProps : { session, ...pageProps} }) {  
  const router = useRouter();
  const [loading, setLoading] = useState(null);

  useEffect(()=>{
    router.events.on("routeChangeStart", (url) => {setLoading(url)});
    router.events.on("routeChangeComplete", (url) => {setLoading(null)});
    router.events.on("routeChangeError", (url) => {setLoading(null)});
  }, [router]);

  const loginModalState = useState(false);
  const [preTitle, setPreTitle] = useState(null);

  return (
    <Fragment>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        <link rel="icon" type="image/png" href="/img/Logo/iconOnly60.png" />
        {
          preTitle 
          ? <title>{preTitle} | HiveDiscover</title>
          : <title>HiveDiscover - Discover more on HIVE</title>
        }
      </Head>
    
      <ApiPing />

      <ThemeProvider theme={theme}>
        <CssBaseline />
          <SessionProvider session={session}>
            <Provider store={store}>
                <Layout loginModalState={loginModalState}>
                  {/* Show loading State  */}
                  {loading ? <DefaultLoader /> : null }
                  <Component {...pageProps} loginModalState={loginModalState} setPreTitle={setPreTitle}/>
                </Layout>
            </Provider>
          </SessionProvider>
      </ThemeProvider>
    </Fragment>
  )
}

export default MyApp
