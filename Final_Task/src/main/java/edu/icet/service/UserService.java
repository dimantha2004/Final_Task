package edu.icet.service;

import com.fortium.employeedirectory.dto.LoginDTO;
import com.fortium.employeedirectory.dto.UserDTO;
import com.fortium.employeedirectory.entity.User;

public interface UserService {
    User register(UserDTO userDTO);
    User login(LoginDTO loginDTO);
}