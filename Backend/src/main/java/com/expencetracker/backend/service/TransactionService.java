package com.expencetracker.backend.service;

import com.expencetracker.backend.dto.TransactionRequest;
import com.expencetracker.backend.dto.TransactionResponse;
import com.expencetracker.backend.entity.Transaction;
import com.expencetracker.backend.entity.User;
import com.expencetracker.backend.repository.TransactionRepository;
import com.expencetracker.backend.repository.UserRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    public TransactionService(TransactionRepository transactionRepository, UserRepository userRepository) {
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
    }

    public TransactionResponse create(Long userId, TransactionRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));

        Transaction transaction = new Transaction(
                user,
                request.type(),
                request.amount(),
                request.category().trim(),
                request.description() == null ? null : request.description().trim(),
                request.transactionDate()
        );
        return toResponse(transactionRepository.save(transaction));
    }

    public List<TransactionResponse> listForUser(Long userId) {
        return transactionRepository.findAllByUser_IdOrderByTransactionDateDesc(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private TransactionResponse toResponse(Transaction transaction) {
        return new TransactionResponse(
                transaction.getId(),
                transaction.getType(),
                transaction.getAmount(),
                transaction.getCategory(),
                transaction.getDescription(),
                transaction.getTransactionDate()
        );
    }
}
