import Link from 'next/link';

const linkStyle = {
  marginRight: 15
};

const Header = () => (
  <div>
    <Link href='/'>
      <a style={linkStyle}>Home</a>
    </Link>
    <Link href='/account'>
      <a style={linkStyle}>Account</a>
    </Link>
    <Link href='/login'>
      <a style={linkStyle}>Login</a>
    </Link>
    <Link href='/sign-in'>
      <a style={linkStyle}>Sign in</a>
    </Link>
  </div>
);

export default Header;