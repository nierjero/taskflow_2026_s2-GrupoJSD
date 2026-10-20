# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: taskflow.spec.ts >> TaskFlow - E2E >> crear tarea desde el tablero
- Location: server/tests/e2e/taskflow.spec.ts:59:7

# Error details

```
Test timeout of 30000ms exceeded.
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - banner [ref=e4]:
    - link "TaskFlow" [ref=e5] [cursor=pointer]:
      - /url: /projects
    - generic [ref=e6]:
      - generic [ref=e7]: e2e-1792537755429-554469@test.com
      - button "Salir" [ref=e8] [cursor=pointer]
  - main [ref=e9]:
    - generic [ref=e10]:
      - generic [ref=e11]:
        - heading "Proyecto 1792537755614-724287" [level=1] [ref=e12]
        - link "Miembros" [ref=e13] [cursor=pointer]:
          - /url: /projects/proj-6/members
      - generic [ref=e14]:
        - generic [ref=e15]:
          - generic [ref=e16]: Título
          - textbox "Título" [ref=e17]: Tarea E2E 1792537756134
        - generic [ref=e18]:
          - generic [ref=e19]: Descripción
          - textbox "Descripción" [active] [ref=e20]: Descripción de la tarea
        - generic [ref=e21]:
          - generic [ref=e22]: Prioridad
          - combobox "Prioridad" [ref=e23]:
            - option "LOW"
            - option "MEDIUM"
            - option "HIGH" [selected]
            - option "CRITICAL"
        - generic [ref=e24]:
          - generic [ref=e25]: Asignado
          - combobox "Asignado" [ref=e26]:
            - option "Sin asignar" [selected]
            - option "user-8"
        - generic [ref=e27]:
          - generic [ref=e28]: Vencimiento
          - textbox "Vencimiento" [ref=e29]
        - button "Crear tarea" [ref=e30] [cursor=pointer]
      - generic [ref=e31]:
        - generic [ref=e32]:
          - generic [ref=e33]: Prioridad
          - combobox "Prioridad" [ref=e34]:
            - option "Todas" [selected]
            - option "LOW"
            - option "MEDIUM"
            - option "HIGH"
            - option "CRITICAL"
        - generic [ref=e35]:
          - generic [ref=e36]: Asignado
          - combobox "Asignado" [ref=e37]:
            - option "Todos" [selected]
            - option "user-8"
        - generic [ref=e38]:
          - generic [ref=e39]: Buscar
          - textbox "Buscar" [ref=e40]
        - button "Aplicar" [ref=e41] [cursor=pointer]
        - button "Limpiar" [ref=e42] [cursor=pointer]
      - paragraph [ref=e43]: "Total: 0"
      - generic [ref=e44]:
        - generic [ref=e45]:
          - heading "Por hacer (0)" [level=2] [ref=e46]:
            - text: Por hacer
            - generic [ref=e47]: (0)
          - list [ref=e48]
        - generic [ref=e49]:
          - heading "En progreso (0)" [level=2] [ref=e50]:
            - text: En progreso
            - generic [ref=e51]: (0)
          - list [ref=e52]
        - generic [ref=e53]:
          - heading "Hecho (0)" [level=2] [ref=e54]:
            - text: Hecho
            - generic [ref=e55]: (0)
          - list [ref=e56]
```