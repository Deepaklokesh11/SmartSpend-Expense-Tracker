package com.expencetracker.backend.repository;

import com.expencetracker.backend.entity.Transaction;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findAllByUser_IdOrderByTransactionDateDesc(Long userId);
}
