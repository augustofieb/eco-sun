package com.ecosun.controller;

import java.util.Arrays;

final class ImageUploadValidator {
    static final int MAX_IMAGE_BYTES = 5 * 1024 * 1024;

    private ImageUploadValidator() {}

    static String detectImageType(byte[] bytes, String declaredContentType) {
        if (bytes == null || bytes.length == 0 || bytes.length > MAX_IMAGE_BYTES) {
            throw new IllegalArgumentException("Imagem vazia ou acima do limite de 5 MB");
        }

        String detectedType = null;
        if (bytes.length >= 8 && Arrays.equals(Arrays.copyOf(bytes, 8),
                new byte[] {(byte) 0x89, 'P', 'N', 'G', 13, 10, 26, 10})) {
            detectedType = "image/png";
        } else if (bytes.length >= 3 && (bytes[0] & 0xff) == 0xff
                && (bytes[1] & 0xff) == 0xd8 && (bytes[2] & 0xff) == 0xff) {
            detectedType = "image/jpeg";
        } else if (bytes.length >= 12 && bytes[0] == 'R' && bytes[1] == 'I'
                && bytes[2] == 'F' && bytes[3] == 'F' && bytes[8] == 'W'
                && bytes[9] == 'E' && bytes[10] == 'B' && bytes[11] == 'P') {
            detectedType = "image/webp";
        }

        if (detectedType == null) {
            throw new IllegalArgumentException("Formato de imagem não permitido");
        }
        if (declaredContentType != null && !declaredContentType.isBlank()
                && !"application/octet-stream".equalsIgnoreCase(declaredContentType)
                && !detectedType.equalsIgnoreCase(declaredContentType)) {
            throw new IllegalArgumentException("Tipo de imagem não corresponde ao conteúdo");
        }
        return detectedType;
    }
}