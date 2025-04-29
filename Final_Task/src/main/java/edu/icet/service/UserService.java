package edu.icet.service;

import edu.icet.dto.LoginDTO;
import edu.icet.dto.UserDTO;
import edu.icet.entity.User;

public interface UserService {
    User register(UserDTO userDTO);
    User login(LoginDTO loginDTO);
}