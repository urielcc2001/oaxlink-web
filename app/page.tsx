import "./landing.css";

export default function LandingPage() {
  return (
    <>
      <nav>
        <div className="wrap">
          <div className="logo">
            <span className="logo-mark">OL</span>OaxLink
          </div>
          <div className="nav-links">
            <a href="#como-funciona">Cómo funciona</a>
            <a href="#servicios">Servicios</a>
            <a href="#precios">Precios</a>
            <a href="#opiniones">Opiniones</a>
            <a href="#contacto">Contacto</a>
          </div>
          <a className="nav-cta" href="#precios">
            Quiero mi tarjeta
          </a>
        </div>
      </nav>

      <section className="hero">
        <div className="wrap">
          <div>
            <div className="hero-eyebrow">Tecnología interactiva para negocios en Oaxaca</div>
            <h1>Tu negocio, a un toque de distancia</h1>
            <p className="lead">
              Una tarjeta con chip NFC y código QR conecta a tus clientes con tus
              reseñas, tus redes y tu menú — sin apps, sin fricción, con solo
              acercar el celular.
            </p>
            <div className="hero-actions">
              <a className="btn btn-primary" href="#precios">Quiero mi tarjeta</a>
              <a className="btn btn-ghost" href="#como-funciona">Ver cómo funciona</a>
            </div>
          </div>
          <div className="illus">
            <div className="stand">
              <div className="qr">
                {Array.from({ length: 25 }).map((_, i) => (
                  <div key={i} />
                ))}
              </div>
              <div className="brand-line">TECNOLOGÍA INTERACTIVA POR OAXLINK.COM</div>
            </div>
            <div className="phone" />
            <div className="wave" />
          </div>
        </div>
      </section>

      <section className="steps" id="como-funciona">
        <div className="wrap">
          <div className="section-head">
            <div className="tag">Cómo funciona</div>
            <h2>De la placa en tu mostrador a la reseña en Google, en tres pasos</h2>
          </div>
          <div className="step-row">
            <div className="step">
              <div className="step-num">01</div>
              <h3>Pides tu placa</h3>
              <p>Eliges tu plan y te armamos tu soporte acrílico con chip NFC y QR, listos para usarse desde el primer día.</p>
            </div>
            <div className="step">
              <div className="step-num">02</div>
              <h3>La activamos con tu info</h3>
              <p>Cargamos el nombre de tu negocio, tu WhatsApp, tus redes y el enlace a tu reseña de Google.</p>
            </div>
            <div className="step">
              <div className="step-num">03</div>
              <h3>Tus clientes tocan o escanean</h3>
              <p>Con el celular sobre la placa, o escaneando el QR, llegan directo a tu página — sin descargar nada.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="services" id="servicios">
        <div className="wrap">
          <div className="section-head">
            <div className="tag">Servicios</div>
            <h2>Todo lo que tu negocio necesita en una sola placa</h2>
          </div>
          <div className="bento">
            <div className="cell wide">
              <div>
                <div className="icon">📊</div>
                <h3>Dashboard de métricas</h3>
                <p>Ve cuántas personas tocaron tu placa, cuántas dejaron reseña en Google y cuántas te escribieron por WhatsApp — actualizado en tiempo real.</p>
              </div>
              <div className="mock">
                <div className="dot" />
                <div className="bars">
                  <span style={{ height: "40%" }} />
                  <span style={{ height: "70%" }} />
                  <span style={{ height: "55%" }} />
                  <span style={{ height: "90%" }} />
                  <span style={{ height: "60%" }} />
                  <span style={{ height: "75%" }} />
                </div>
              </div>
            </div>
            <div className="cell">
              <div className="icon">⭐</div>
              <h3>Impulso de reseñas</h3>
              <p>Un botón directo a tu ficha de Google para que dejar una reseña te tome a tus clientes diez segundos.</p>
            </div>
            <div className="cell">
              <div className="icon">📎</div>
              <h3>Menú digital</h3>
              <p>Sube el PDF de tu menú o tus promociones y actualízalo cuando quieras, sin reimprimir nada.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="pricing" id="precios">
        <div className="wrap">
          <div className="section-head">
            <div className="tag">Precios</div>
            <h2>Empieza con una placa, crece cuando quieras métricas</h2>
          </div>
          <div className="plans">
            <div className="plan">
              <div className="name">Plan Básico</div>
              <div className="price">$450 <span>pago único</span></div>
              <div className="desc">Tu placa física, lista para conectar a tus clientes desde el día uno.</div>
              <ul>
                <li><span className="check">✓</span> Soporte acrílico + chip NFC + QR</li>
                <li><span className="check">✓</span> Botón directo a tu reseña de Google</li>
                <li><span className="check">✓</span> WhatsApp con mensaje precargado</li>
                <li><span className="check">✓</span> Enlace a tus redes sociales</li>
              </ul>
              <a className="btn btn-ghost" href="#contacto">Pedir mi placa</a>
            </div>
            <div className="plan featured">
              <div className="name">Plan Pro</div>
              <div className="price">$99 <span>/ mes</span> <span className="price-badge">Primer mes gratis</span></div>
              <div className="desc">Todo lo del plan Básico, más el menú digital y tus métricas.</div>
              <ul>
                <li><span className="check">✓</span> Todo lo del Plan Básico</li>
                <li><span className="check">✓</span> Menú o catálogo en PDF, siempre editable</li>
                <li><span className="check">✓</span> Dashboard de escaneos, reseñas y WhatsApp</li>
                <li><span className="check">✓</span> Cambios de promociones cuando quieras</li>
              </ul>
              <a className="btn btn-primary" href="#contacto">Empezar con Pro</a>
            </div>
            <div className="plan">
              <div className="name">Mesas para restaurantes</div>
              <div className="price">$333 <span>/ placa (mínimo 6)</span></div>
              <div className="desc">Placas para cada mesa, con menú digital y datos de pago listos.</div>
              <ul>
                <li><span className="check">✓</span> Placas NFC + QR para cada mesa</li>
                <li><span className="check">✓</span> Menú digital por mesa</li>
                <li><span className="check">✓</span> Datos de pago por transferencia en cada mesa</li>
                <li><span className="check">✓</span> Primer mes de Plan Pro incluido</li>
              </ul>
              <a className="btn btn-ghost" href="#contacto">Cotizar mesas</a>
            </div>
          </div>
        </div>
      </section>

      <section className="testimonials" id="opiniones">
        <div className="wrap">
          <div className="section-head">
            <div className="tag">Opiniones</div>
            <h2>Negocios que ya están a un toque de sus clientes</h2>
          </div>
          <div className="quotes">
            <div className="quote">
              <p>&quot;Desde que pusimos la placa en el mostrador, nos llegan más reseñas de las que pedíamos por mensaje.&quot;</p>
              <div className="who"><strong>Refaccionaria de motos</strong> · Oaxaca</div>
            </div>
            <div className="quote">
              <p>&quot;Ya no imprimimos el menú cada que cambian los precios, solo subimos el PDF nuevo.&quot;</p>
              <div className="who"><strong>Cafetería</strong> · Centro de Oaxaca</div>
            </div>
            <div className="quote">
              <p>&quot;Me gusta poder ver cuánta gente escanea la placa cada semana, antes no tenía idea.&quot;</p>
              <div className="who"><strong>Barbería</strong> · Oaxaca</div>
            </div>
          </div>
        </div>
      </section>

      <section className="contact" id="contacto">
        <div className="wrap">
          <h2>¿Listo para poner tu negocio a un toque de distancia?</h2>
          <p>Escríbenos y armamos tu placa esta semana. Sin contratos forzosos, empiezas con el plan que te haga sentido.</p>
          <div className="actions">
            <a className="btn btn-primary" href="https://wa.me/529510000000?text=Hola,%20quiero%20mi%20placa%20OaxLink" target="_blank" rel="noreferrer">
              💬 Escríbenos por WhatsApp
            </a>
            <a className="btn btn-ghost" href="mailto:contacto@oaxlink.com">contacto@oaxlink.com</a>
          </div>
          <div className="support-grid">
            <div className="support-item">
              <h4>Soporte técnico</h4>
              <p>¿Tu placa dejó de redirigir o necesitas actualizar tu info? Te respondemos el mismo día por WhatsApp.</p>
            </div>
            <div className="support-item">
              <h4>Instalación</h4>
              <p>Te explicamos dónde colocar tu placa para que tenga la mejor señal NFC y visibilidad para tus clientes.</p>
            </div>
            <div className="support-item">
              <h4>Cobertura</h4>
              <p>Entregamos en toda la ciudad de Oaxaca de Juárez y alrededores; para el resto del estado, coordinamos envío.</p>
            </div>
          </div>
        </div>
      </section>

      <footer>
        <div className="wrap">
          <div>© 2026 OaxLink — Oaxaca, México</div>
          <div>oaxlink.com</div>
        </div>
      </footer>
    </>
  );
}
