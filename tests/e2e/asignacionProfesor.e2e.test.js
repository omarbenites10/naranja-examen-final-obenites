const request = require('supertest');
const app = require('../../index');
const usuariosModel = require('../../models/usuario.model');
const bcrypt = require('bcryptjs'); 

let cookie;
let cantidadAsignaciones = 0;
let cantidadProfesoresHome = 0;

describe('Test E2E Asignación de Profesor', () => {
  //const emailProfesor = 'profesor2@correo.com';
  const emailProfesor = `profesor_${Date.now()}@correo.com`;
  const idCurso = 20;

beforeAll(async () => {
  const homeRes = await request(app).get('/public/home');
  expect(homeRes.statusCode).toBe(200);
  cantidadProfesoresHome = (homeRes.text.match(/class="team-item/g) || []).length;
  console.log('Cantidad actual de profesores en /public/home:', cantidadProfesoresHome);

  const res = await request(app)
    .post('/auth/admin/login-test')
    .send({ email: 'admin1@correo.com', contrasena: '123456' });

  expect(res.statusCode).toBe(200);
  expect(res.body.success).toBe(true);
  expect(res.headers['set-cookie']).toBeDefined();
  cookie = res.headers['set-cookie'];

  // Insertar profesor directamente
  const hash = await bcrypt.hash('123456', 10);
  await usuariosModel.crearUsuario({
    nombre: 'Profe de Test',
    email_usuario: emailProfesor,
    contrasena: hash,
    ci: '9999999'
  });
});


  test('Paso 2: Contar asignaciones actuales', async () => {
    const res = await request(app)
      .get('/admin/asignaciones-profesor')
      .set('Cookie', cookie);

    expect(res.statusCode).toBe(200);
    cantidadAsignaciones = (res.text.match(/class="asignacion-item"/g) || []).length;
    console.log('Cantidad actual de asignaciones:', cantidadAsignaciones);
  });

  test('Paso 3: Asignar profesor a curso', async () => {
    const res = await request(app)
      .post('/admin/asignar-profesor')
      .set('Cookie', cookie)
      .send({
        id_curso: idCurso,
        email_usuario: emailProfesor
      });

    console.log('Asignar profesor - Status:', res.statusCode);
    expect([200, 302]).toContain(res.statusCode);
  });

  test('Paso 4: Verificar cantidad de asignaciones aumentó en 1', async () => {
    const res = await request(app)
      .get('/admin/asignaciones-profesor')
      .set('Cookie', cookie);

    expect(res.statusCode).toBe(200);
    const cantidadFinal = (res.text.match(/class="asignacion-item"/g) || []).length;
    console.log(`Cantidad final: ${cantidadFinal}, Inicial: ${cantidadAsignaciones}`);
    expect(cantidadFinal).toBe(cantidadAsignaciones + 1);
  });

  test('Paso 5: Verificar cantidad de profesores en /public/home aumentó en 1', async () => {
    const res = await request(app).get('/public/home');
    expect(res.statusCode).toBe(200);
    const cantidadFinalHome = (res.text.match(/class="team-item/g) || []).length;
    console.log(`Cantidad final en /public/home: ${cantidadFinalHome}, Inicial: ${cantidadProfesoresHome}`);
    expect(cantidadFinalHome).toBe(cantidadProfesoresHome + 1);
  });
});
