package com.ecosun.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@Profile("local")
public class LocalCatalogInitializer implements CommandLineRunner {
    private final JdbcTemplate jdbcTemplate;

    public LocalCatalogInitializer(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        seedCategories();
        seedProducts();
    }

    private void seedCategories() {
        Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM Categoria", Integer.class);
        if (count != null && count > 0) return;

        jdbcTemplate.update("INSERT INTO Categoria (nome, descricao, especificacoes_obrigatorias) VALUES (?, ?, ?)",
                "Painéis Solares", "Painéis fotovoltaicos para geração de energia", "{\"potencia\":\"W\"}");
        jdbcTemplate.update("INSERT INTO Categoria (nome, descricao, especificacoes_obrigatorias) VALUES (?, ?, ?)",
                "Inversores", "Inversores para conversão de energia", "{\"potencia\":\"W\"}");
        jdbcTemplate.update("INSERT INTO Categoria (nome, descricao, especificacoes_obrigatorias) VALUES (?, ?, ?)",
                "Baterias", "Sistemas de armazenamento de energia", "{\"capacidade\":\"Ah\"}");
        jdbcTemplate.update("INSERT INTO Categoria (nome, descricao, especificacoes_obrigatorias) VALUES (?, ?, ?)",
                "Controladores", "Controladores de carga e descarga", "{\"corrente_maxima\":\"A\"}");
    }

    private void seedProducts() {
        Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM Produto", Integer.class);
        if (count != null && count > 0) return;

        insertProduct("Painel Solar 400W", "Painel solar monocristalino de alta eficiência",
                899.99, "Painéis Solares",
                "{\"energia\":400,\"dimensoes\":\"200x100x3.5\",\"eficiencia\":21.5,\"garantia\":25}", "[2,4]");
        insertProduct("Inversor 3000W", "Inversor senoidal puro para sistemas residenciais",
                1299.99, "Inversores",
                "{\"potencia\":3000,\"tensao_entrada\":\"12-48\",\"tensao_saida\":\"220\",\"eficiencia\":95}", "[1,3]");
        insertProduct("Bateria Lithium 100Ah", "Bateria de lítio para armazenamento de energia",
                2499.99, "Baterias",
                "{\"capacidade\":100,\"tensao\":12,\"tipo\":\"Lítio\",\"ciclos_vida\":6000}", "[2,4]");
        insertProduct("Controlador MPPT 60A", "Controlador de carga com tecnologia MPPT",
                599.99, "Controladores",
                "{\"corrente_maxima\":60,\"tensao_sistema\":\"12/24/48\",\"tipo\":\"MPPT\",\"display\":\"LCD\"}", "[1,3]");
    }

    private void insertProduct(String name, String description, double price,
                               String categoryName, String specifications, String compatibleProducts) {
        Integer categoryId = jdbcTemplate.queryForObject(
                "SELECT id FROM Categoria WHERE nome = ?", Integer.class, categoryName);
        jdbcTemplate.update(
                "INSERT INTO Produto (nome, descricao, preco, categoria_id, status_produto, fotoUrl, especificacoes_tecnicas, produtos_compativeis) " +
                        "VALUES (?, ?, ?, ?, 'ATIVO', NULL, ?, ?)",
                name, description, price, categoryId, specifications, compatibleProducts);
    }
}