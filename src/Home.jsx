import './Home.css'
import { Link } from 'react-router-dom'
import shoppingCartIcon from './assets/shoppingcart.png'
import Logo from './assets/Logo.png'

const Home = () => {
    return (
        <header className="cabecalho">
        <nav className="topo">
            <ul className="menu">
                <li><img className='Logo' src={Logo} alt="Logo" /></li>
                <li>
                    <input type="search" className="search-box" placeholder="Pesquisar..." />
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
