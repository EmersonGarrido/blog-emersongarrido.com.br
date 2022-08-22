import { useEffect } from 'react';
import { useRouter } from 'next/router';
import NProgressLib from 'nprogress';

const NProgress: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const start = () => {
      timeout = setTimeout(NProgressLib.start, 100);
    };

    const done = () => {
      clearTimeout(timeout);
      NProgressLib.done();
    };

    router.events.on('routeChangeStart', start);
    router.events.on('routeChangeComplete', done);
    router.events.on('routeChangeError', done);
    return () => {
      router.events.off('routeChangeStart', start);
      router.events.off('routeChangeComplete', done);
      router.events.off('routeChangeError', done);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <></>;
}

export default NProgress;