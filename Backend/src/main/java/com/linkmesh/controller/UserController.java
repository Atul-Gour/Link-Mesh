package com.linkmesh.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.util.Map;

@RestController
@RequiredArgsConstructor
public class UserController {

    @GetMapping("/me")
    public Map<String, Object> me(
            @AuthenticationPrincipal OAuth2User user) {
        return user.getAttributes();
    }

}