package com.expencetracker.backend.controller;

import com.expencetracker.backend.dto.RegisterRequest;
import com.expencetracker.backend.dto.AuthResponse;
import com.expencetracker.backend.dto.LoginRequest;
import com.expencetracker.backend.dto.UserResponse;
import com.expencetracker.backend.entity.User;
import com.expencetracker.backend.service.AuthService;
import com.expencetracker.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final AuthService authService;

    public AuthController(UserService userService, AuthService authService) {
        this.userService = userService;
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest request) {
        User user = userService.register(request);
        UserResponse response = new UserResponse(user.getId(), user.getDisplayName(), user.getEmail());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }
}
