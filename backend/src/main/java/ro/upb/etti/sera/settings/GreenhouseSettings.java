package ro.upb.etti.sera.settings;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

/**
 * Configurarea serei. Exista un singur rand (id = 1): aplicatia monitorizeaza o
 * singura sera. Valorile sunt folosite DOAR pentru afisare si alerte - backend-ul nu
 * trimite nimic catre ESP32.
 */
@Entity
@Table(name = "greenhouse_settings")
public class GreenhouseSettings {

    public static final short SINGLETON_ID = 1;

    @Id
    @Column(name = "id", nullable = false)
    private Short id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description")
    private String description;

    @Column(name = "read_interval_second", nullable = false)
    private int readIntervalSecond;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected GreenhouseSettings() {
        // Hibernate
    }

    public Short getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public int getReadIntervalSecond() {
        return readIntervalSecond;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void update(String name, String description, int readIntervalSecond, Instant updatedAt) {
        this.name = name;
        this.description = description;
        this.readIntervalSecond = readIntervalSecond;
        this.updatedAt = updatedAt;
    }
}
