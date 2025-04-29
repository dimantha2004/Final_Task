package edu.icet.service.impl;

import edu.icet.dto.LoginDTO;
import edu.icet.dto.UserDTO;
import edu.icet.entity.User;
import edu.icet.exception.ValidationException;
import edu.icet.repository.UserRepository;
import edu.icet.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl implements UserService {
    
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    
    @Autowired
    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }
    
    @Override
    public User register(UserDTO userDTO) {
        if (userRepository.existsByUsername(userDTO.getUsername())) {
            throw new ValidationException("Username already exists");
        }
        
        if (userRepository.existsByEmail(userDTO.getEmail())) {
            throw new ValidationException("Email already exists");
        }
        
        User user = new User();
        user.setUsername(userDTO.getUsername());
        user.setEmail(userDTO.getEmail());
        user.setPassword(passwordEncoder.encode(userDTO.getPassword()));
        
        return userRepository.save(user);
    }
    
    @Override
    public User login(LoginDTO loginDTO) {
        User user = userRepository.findByUsername(loginDTO.getUsername())
            .orElseThrow(() -> new ValidationException("Invalid username or password"));
            
        if (!passwordEncoder.matches(loginDTO.getPassword(), user.getPassword())) {
            throw new ValidationException("Invalid username or password");
        }
        
        return user;
    }
}