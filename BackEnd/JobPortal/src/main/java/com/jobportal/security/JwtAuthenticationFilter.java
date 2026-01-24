package com.jobportal.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;
    private final CustomUserDetailsService customUserDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        try {
            String jwt = getJwtFromRequest(request);
            System.out.println("DEBUG: JWT found in request: " + (jwt != null ? "YES" : "NO"));

            if (StringUtils.hasText(jwt) && !"undefined".equals(jwt) && !"null".equals(jwt)) {
                System.out.println("DEBUG: Token length: " + jwt.length());
                String[] parts = jwt.split("\\.");
                System.out.println("DEBUG: Token parts count: " + parts.length);
                if (parts.length > 0)
                    System.out.println("DEBUG: Header: " + parts[0]);

                boolean isValid = jwtTokenProvider.validateToken(jwt);
                System.out.println("DEBUG: Token validation result: " + isValid);

                if (isValid) {
                    UUID userId = jwtTokenProvider.getUserIdFromToken(jwt);
                    System.out.println("DEBUG: User ID from token: " + userId);

                    UserDetails userDetails = customUserDetailsService.loadUserById(userId);
                    System.out.println("DEBUG: User loaded: " + userDetails.getUsername() + ", Authorities: "
                            + userDetails.getAuthorities());

                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    System.out.println("DEBUG: Authentication set in SecurityContext");
                }
            }
        } catch (Exception ex) {
            log.error("Could not set user authentication in security context", ex);
            System.out.println("DEBUG: Authentication Filter Error: " + ex.getMessage());
            ex.printStackTrace();
        }

        filterChain.doFilter(request, response);
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
