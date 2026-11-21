import { Link } from 'react-router-dom';
import { useDocTitle } from '../hooks/useDocTitle';

export default function NotFound() {
  useDocTitle('Page not found');
  return (
    <main id="main" className="page"><div className="wrap">
      <header className="page-head"><p className="eyebrow">404</p><h1>Lost in the <em>sky</em>.</h1>
        <p className="page-sub">That page doesn't exist.</p><Link className="btn-solid" to="/">Back home</Link></header>
    </div></main>
  );
}
