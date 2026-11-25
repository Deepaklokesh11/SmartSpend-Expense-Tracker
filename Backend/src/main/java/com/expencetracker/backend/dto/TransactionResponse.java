package com.expencetracker.backend.dto;

import com.expencetracker.backend.entity.TransactionType;
import java.math.BigDecimal;
import java.time.LocalDate;

public record TransactionResponse(
        Long id,
        TransactionType type,
        BigDecimal amount,
        String category,
        String description,
        LocalDate transactionDate
) {
}
