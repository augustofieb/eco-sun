import './Home.css'
import { Link } from 'react-router-dom'
import shoppingCartIcon from './assets/shopping-cart.svg'

const Home = () => {
    return (
        <header className="cabecalho">
        <nav className="topo">
            <ul className="menu">
                <li><h1>Logo</h1></li>
                <li><p>ECO SUN</p></li>
                <li>
                    <input type="search" className="search-box" placeholder="Search..." />
                </li>
                
                <li className="spacer"> </li>
                <li>
                    <Link to="/create-account" className="create-account">Crie sua conta</Link>
                </li>
                <li>
                    <Link to="/sign-in" className="sign-in">Entre</Link>
                </li>
                <li>
                    <Link to="/cart" className="shopping-cart">
                        <img src={shoppingCartIcon} alt="Shopping Cart" width="24" height="24" />
                    </Link>
                </li>
            </ul>
        </nav>
    </header>
    )
}

export default Home
