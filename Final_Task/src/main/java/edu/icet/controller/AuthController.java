package edu.icet.controller;

import edu.icet.dto.LoginDTO;
import edu.icet.dto.UserDTO;
import edu.icet.entity.User;
import edu.icet.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:4200")
public class AuthController {
    
    private final UserService userService;
    
    @Autowired
    public AuthController(UserService userService) {
        this.userService = userService;
    }
    
    @PostMapping("/register")
    public ResponseEntity<User> register(@Valid @RequestBody UserDTO userDTO) {
        User registeredUser = userService.register(userDTO);
        return ResponseEntity.ok(registeredUser);
    }
    
    @PostMapping("/login")
    public ResponseEntity<User> login(@Valid @RequestBody LoginDTO loginDTO) {
        User loggedInUser = userService.login(loginDTO);
        return ResponseEntity.ok(loggedInUser);
    }
}