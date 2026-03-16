package com.ecosun.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/estatisticas")
@CrossOrigin(origins = "*")
public class StatsController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @GetMapping
    public ResponseEntity<?> getEstatisticas() {
        try {
            Map<String, Object> stats = new HashMap<>();

            stats.put("totalUsuarios", jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM Usuario", Integer.class));
            stats.put("usuariosAtivos", jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM Usuario WHERE StatusUsuario = 'ATIVO'", Integer.class));
            stats.put("totalProdutos", jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM Produto WHERE status_produto = 'ATIVO'", Integer.class));
            stats.put("totalOrcamentos", jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM Orcamento", Integer.class));
            stats.put("totalAvaliacoes", jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM Avaliacao", Integer.class));

            Double mediaOrcamentos = jdbcTemplate.queryForObject(
                "SELECT AVG(CAST(preco_total AS FLOAT)) FROM Orcamento WHERE preco_total > 0", Double.class);
            stats.put("mediaValorOrcamento", mediaOrcamentos != null ? mediaOrcamentos : 0);

            List<Map<String, Object>> maisAvaliados = jdbcTemplate.queryForList(
                "SELECT p.id, p.nome, COUNT(a.id) as total_avaliacoes " +
                "FROM Produto p LEFT JOIN Avaliacao a ON p.id = a.ProdutoId " +
                "WHERE p.status_produto = 'ATIVO' " +
                "GROUP BY p.id, p.nome " +
                "ORDER BY total_avaliacoes DESC " +
                "OFFSET 0 ROWS FETCH NEXT 5 ROWS ONLY");
            stats.put("produtosMaisAvaliados", maisAvaliados);

            List<Map<String, Object>> allOrcamentos = jdbcTemplate.queryForList(
                "SELECT produtos_selecionados FROM Orcamento WHERE produtos_selecionados IS NOT NULL");
            stats.put("orcamentosRaw", allOrcamentos);

            List<Map<String, Object>> orcamentosPorMes = jdbcTemplate.queryForList(
                "SELECT FORMAT(data_criacao, 'yyyy-MM') as mes, COUNT(*) as total " +
                "FROM Orcamento " +
                "WHERE data_criacao >= DATEADD(MONTH, -6, GETDATE()) " +
                "GROUP BY FORMAT(data_criacao, 'yyyy-MM') " +
                "ORDER BY mes ASC");
            stats.put("orcamentosPorMes", orcamentosPorMes);

            List<Map<String, Object>> usuariosPorMes = jdbcTemplate.queryForList(
                "SELECT FORMAT(DataCadastro, 'yyyy-MM') as mes, COUNT(*) as total " +
                "FROM Usuario " +
                "WHERE DataCadastro >= DATEADD(MONTH, -6, GETDATE()) " +
                "GROUP BY FORMAT(DataCadastro, 'yyyy-MM') " +
                "ORDER BY mes ASC");
            stats.put("usuariosPorMes", usuariosPorMes);

            List<Map<String, Object>> porCategoria = jdbcTemplate.queryForList(
                "SELECT c.nome, COUNT(p.id) as total " +
                "FROM Categoria c LEFT JOIN Produto p ON c.id = p.categoria_id AND p.status_produto = 'ATIVO' " +
                "GROUP BY c.nome ORDER BY total DESC");
            stats.put("produtosPorCategoria", porCategoria);

            List<Map<String, Object>> recentUsers = jdbcTemplate.queryForList(
                "SELECT TOP 5 id, Nome as nome, Email as email, DataCadastro as data_cadastro " +
                "FROM Usuario ORDER BY DataCadastro DESC");
            stats.put("usuariosRecentes", recentUsers);

            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erro: " + e.getMessage());
        }
    }
}
