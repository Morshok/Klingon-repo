package klingon.webserver;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import javax.servlet.http.HttpServletRequest;
import java.net.URI;
import java.net.URISyntaxException;

/**
 * Handles routing related proxy task.
 *
 * @author Konrad Rej
 * @version 2021-09-21
 */
@RestController
public class RouterProxyController {
    /**
     * Proxies requests from /api/routing/ to https://api.openrouteservice.org/
     * Also adds authorization header with API key for openrouteservice
     *
     * @param body    request body
     * @param method  request method
     * @param request the request
     * @return response from openrouteservice
     * @throws URISyntaxException if request url is invalid
     */
    @RequestMapping(value = "/api/routing/**", produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String mirrorORS(@RequestBody String body, HttpMethod method, HttpServletRequest request) throws URISyntaxException {
        ResponseEntity<String> responseEntity;
        try {
            String requestUri = request.getRequestURI().replace("/api/routing", "");
            URI uri = new URI("https", null, "api.openrouteservice.org", 443, requestUri, request.getQueryString(), null);

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "5b3ce3597851110001cf6248d29230ce91e840789e9e3b73cf909b78");
            headers.set("Accept", "application/json");
            headers.set("Content-Type", "application/json");

            RestTemplate restTemplate = new RestTemplate();
            HttpEntity<String> httpEntity = new HttpEntity<>(body, headers);
            responseEntity = restTemplate.exchange(uri, method, httpEntity, String.class);
        } catch (HttpStatusCodeException e) {
            return e.getResponseBodyAsString();
        }

        return responseEntity.getBody();
    }
}
