package com.example.sampleApp.features.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Component
@Order(-200)
public class RateLimitFilter implements Filter {

    private final Map<String, ClientStats> clients = new ConcurrentHashMap<>();
    private static final int MAX_REQUESTS = 100;
    private static final long WINDOW_MS = 60_000;

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest req = (HttpServletRequest) request;
        String ip = req.getRemoteAddr();
        long now = System.currentTimeMillis();

        ClientStats stats = clients.computeIfAbsent(ip, k -> new ClientStats(now));

        synchronized (stats) {
            if (now - stats.windowStart > WINDOW_MS) {
                stats.windowStart = now;
                stats.count.set(0);
            }
            if (stats.count.incrementAndGet() > MAX_REQUESTS) {
                HttpServletResponse resp = (HttpServletResponse) response;
                resp.setStatus(429);
                resp.setContentType("application/json");
                resp.getWriter().write("{\"error\":\"Too many requests\",\"message\":\"Rate limit exceeded\"}");
                return;
            }
        }

        chain.doFilter(request, response);
    }

    private static class ClientStats {
        long windowStart;
        AtomicInteger count = new AtomicInteger(0);
        ClientStats(long now) { this.windowStart = now; }
    }
}
