package com.faysal.Elect;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class ElectApplicationTests {

	@Test
	void contextLoads() {
        // Verifies the full Spring context (security, JPA, JWT beans) wires up correctly.
	}

}
