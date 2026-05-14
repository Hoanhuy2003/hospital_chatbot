import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    // Kiểm tra xem đã đăng nhập chưa khi load trang
    useEffect(() => {
        const savedUserId = localStorage.getItem('userId');
        const savedRole = localStorage.getItem('role');
        const savedName = localStorage.getItem('fullName');
        
        if (savedUserId && savedRole) {
            setUser({ id: savedUserId, role: savedRole, fullName: savedName });
        }
    }, []);

    const login = (userData) => {
        setUser(userData);
        localStorage.setItem('userId', userData.id);
        localStorage.setItem('role', userData.role);
        localStorage.setItem('fullName', userData.fullName);
    };

    // Cập nhật một phần thông tin user (vd: sau khi sửa hồ sơ)
    const updateUser = (partial) => {
        setUser((prev) => ({ ...prev, ...partial }));
        if (partial.fullName) {
            localStorage.setItem('fullName', partial.fullName);
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.clear();
        window.location.href = '/dang-nhap';
    };

    return (
        <AuthContext.Provider value={{ user, login, updateUser, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);