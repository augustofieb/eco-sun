package com.ecosun.security;

import com.ecosun.entity.Usuario;
import com.ecosun.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

@Service
public class JwtUserDetailsService implements UserDetailsService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Override
    public UserDetails loadUserByUsername(String username) {
        return loadUserByEmail(username);
    }

    public UserDetails loadUserByEmail(String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado"));

        Collection<GrantedAuthority> authorities = mapAuthorities(usuario);

        // password é irrelevante no fluxo JWT (stateless), mas o UserDetails exige um campo.
        // Usamos senha hash do banco.
        return User.withUsername(usuario.getEmail())
                .password(usuario.getSenha() != null ? usuario.getSenha() : "")
                .authorities(authorities)
                .accountLocked("INATIVO".equalsIgnoreCase(usuario.getStatusUsuario()))
                .build();
    }

    private Collection<GrantedAuthority> mapAuthorities(Usuario usuario) {
        List<GrantedAuthority> authorities = new ArrayList<>();

        // Use ROLE_ prefix para hasRole('ADMIN') funcionar.
        String nivel = usuario.getNivelAcesso();
        if (nivel == null) {
            nivel = "CLIENTE";
        }

        // Exemplo: nivelAcesso=ADMIN => ROLE_ADMIN
        authorities.add(new SimpleGrantedAuthority("ROLE_" + nivel));

        // Opcional: authority granular por autoridade sem ROLE prefix
        // authorities.add(new SimpleGrantedAuthority("nivel:" + nivel));

        return authorities;
    }
}

