import Layout from "../components/Layout";
import Link from 'next/link';
import fetch from 'isomorphic-unfetch';

const PostLink = ({ post: show }) => (
  <li key={show.id}>
    <Link as={`/p/${show.id}`} href={`/post?id=${show.id}`}>
      <a>{show.name}</a>
    </Link>
    <style jsx>{`
      li {
        list-style: none;
        margin: 5px 0;
      }

      a {
        text-decoration: none;
        color: blue;
        font-family: "Arial";
      }

      a:hover {
        opacity: 0.6;
      }
    `}</style>
  </li>
);

const Index = props => (
  <Layout>
    <h1>Batman TV Shows</h1>
    <Link as="/login" href="/login?test=1&d='fdf'">
      <a>login page</a>
    </Link>
    <ul>
      {props.shows.map(({ show }) => (
        <PostLink key={show.id} post={show} />
      ))}
    </ul>
    <style jsx>{`
    h1, a {
      font-family: "Arial";
    }

    ul {
      padding: 0;
    }
    `}</style>
  </Layout>
);

Index.getInitialProps = async () => {
  const res = await fetch('https://api.tvmaze.com/search/shows?q=batman')
  const data = await res.json()

  console.log(`Show data fetched. Count: ${data.length}`)

  return {
    shows: data
  }
};

export default Index;