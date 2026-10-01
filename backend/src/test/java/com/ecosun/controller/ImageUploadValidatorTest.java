package com.ecosun.controller;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ImageUploadValidatorTest {
    @Test
    void reconheceAssinaturasPermitidasEUsaOTipoDetectado() {
        assertThat(ImageUploadValidator.detectImageType(
                new byte[] {(byte) 0x89, 'P', 'N', 'G', 13, 10, 26, 10}, "image/png"))
                .isEqualTo("image/png");
        assertThat(ImageUploadValidator.detectImageType(
                new byte[] {(byte) 0xff, (byte) 0xd8, (byte) 0xff}, "image/jpeg"))
                .isEqualTo("image/jpeg");
        assertThat(ImageUploadValidator.detectImageType(
                new byte[] {'R', 'I', 'F', 'F', 0, 0, 0, 0, 'W', 'E', 'B', 'P'}, "image/webp"))
                .isEqualTo("image/webp");
    }

    @Test
    void rejeitaConteudoFalsoTipoDivergenteEArquivoAcimaDoLimite() {
        assertThatThrownBy(() -> ImageUploadValidator.detectImageType(
                "conteudo falso".getBytes(), "image/png"))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> ImageUploadValidator.detectImageType(
                new byte[] {(byte) 0x89, 'P', 'N', 'G', 13, 10, 26, 10}, "image/jpeg"))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> ImageUploadValidator.detectImageType(
                new byte[ImageUploadValidator.MAX_IMAGE_BYTES + 1], "image/png"))
                .isInstanceOf(IllegalArgumentException.class);
    }
}