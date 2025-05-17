# control_gui.py

import tkinter as tk
from tkinter import messagebox
from tkinter import ttk
import subprocess
import sys
import os
import signal
import platform
import webbrowser
import threading

# Opcional para gerenciamento de processos por porta
try:
    import psutil
except ImportError:
    psutil = None


class ControllerGUI:
    # Caminhos absolutos fixos
    BASE_DIR = r"C:\controlefinanceiro"
    API_DIR = os.path.join(BASE_DIR, "controlefin.api")
    NEXT_DIR = os.path.join(BASE_DIR, "controlefin.app")

    API_PORT = 8000
    NEXT_PORT = 3000

    def __init__(self, master):
        # Verifica se as pastas existem
        for path in (self.API_DIR, self.NEXT_DIR):
            if not os.path.isdir(path):
                messagebox.showerror(
                    "Erro",
                    f"Pasta não encontrada:\n{path}\n\n"
                    "Certifique-se de que o executável está em C:\\controlefinanceiro",
                )
                master.destroy()
                return

        # Inicializa atributos de processo
        self.api_process = None
        self.next_process = None

        # Janela principal
        self.master = master
        master.title("Controle de Apps")
        master.geometry("400x360")
        master.resizable(False, False)
        master.configure(padx=10, pady=10)

        # Estilo ttk
        style = ttk.Style(master)
        style.theme_use("clam")
        style.configure("TFrame", background="#f0f0f0")
        style.configure("TLabel", background="#f0f0f0", font=("Segoe UI", 10))
        style.configure("Header.TLabel", font=("Segoe UI", 11, "bold"))
        style.configure("TButton", font=("Segoe UI", 9), padding=6)

        # FastAPI frame
        api_frame = ttk.Frame(master)
        api_frame.pack(fill="x", pady=(0, 10))
        ttk.Label(api_frame, text="FastAPI", style="Header.TLabel").pack(anchor="w")
        btns = ttk.Frame(api_frame)
        btns.pack(fill="x", pady=5)

        self.api_start_btn = ttk.Button(btns, text="Iniciar", command=self.start_api)
        self.api_stop_btn = ttk.Button(btns, text="Parar", command=self.stop_api)
        self.api_status_btn = ttk.Button(btns, text="Status", command=self.status_api)
        self.api_open_btn = ttk.Button(btns, text="Abrir", command=self.open_api)
        for b in (
            self.api_start_btn,
            self.api_stop_btn,
            self.api_status_btn,
            self.api_open_btn,
        ):
            b.pack(side="left", expand=True, fill="x", padx=2)

        ttk.Label(api_frame, text=f"URL: http://localhost:{self.API_PORT}").pack()
        self.api_status_label = ttk.Label(
            api_frame, text="Status: —", foreground="gray"
        )
        self.api_status_label.pack(pady=(2, 0))
        self.api_loading = ttk.Label(api_frame, text="", font=("Segoe UI", 9, "italic"))
        self.api_loading.pack()

        # Next.js frame
        next_frame = ttk.Frame(master)
        next_frame.pack(fill="x")
        ttk.Label(next_frame, text="Next.js App", style="Header.TLabel").pack(
            anchor="w"
        )
        btns2 = ttk.Frame(next_frame)
        btns2.pack(fill="x", pady=5)

        self.next_start_btn = ttk.Button(btns2, text="Iniciar", command=self.start_next)
        self.next_stop_btn = ttk.Button(btns2, text="Parar", command=self.stop_next)
        self.next_status_btn = ttk.Button(
            btns2, text="Status", command=self.status_next
        )
        self.next_open_btn = ttk.Button(btns2, text="Abrir", command=self.open_next)
        for b in (
            self.next_start_btn,
            self.next_stop_btn,
            self.next_status_btn,
            self.next_open_btn,
        ):
            b.pack(side="left", expand=True, fill="x", padx=2)

        ttk.Label(next_frame, text=f"URL: http://localhost:{self.NEXT_PORT}").pack()
        self.next_status_label = ttk.Label(
            next_frame, text="Status: —", foreground="gray"
        )
        self.next_status_label.pack(pady=(2, 0))
        self.next_loading = ttk.Label(
            next_frame, text="", font=("Segoe UI", 9, "italic")
        )
        self.next_loading.pack()

        # Botão Sair
        ttk.Button(master, text="Sair", command=self.on_close).pack(pady=10)

        # Status inicial
        self.update_api_status_label()
        self.update_next_status_label()

    def disable_buttons(self):
        for btn in (
            self.api_start_btn,
            self.api_stop_btn,
            self.api_status_btn,
            self.api_open_btn,
            self.next_start_btn,
            self.next_stop_btn,
            self.next_status_btn,
            self.next_open_btn,
        ):
            btn.state(["disabled"])

    def enable_buttons(self):
        for btn in (
            self.api_start_btn,
            self.api_stop_btn,
            self.api_status_btn,
            self.api_open_btn,
            self.next_start_btn,
            self.next_stop_btn,
            self.next_status_btn,
            self.next_open_btn,
        ):
            btn.state(["!disabled"])

    # ─── FastAPI ─────────────────────────────────────────────────────────────────

    def _start_api_thread(self):
        py = os.path.join(self.API_DIR, ".venv", "Scripts", "python.exe")
        if not os.path.exists(py):
            py = os.path.join(self.API_DIR, ".venv", "bin", "python")
        if not os.path.exists(py):
            py = sys.executable

        # instalar requisitos
        self.master.after(0, self.disable_buttons)
        self.master.after(0, lambda: self.api_loading.config(text="🔄 pip install..."))
        self.master.after(0, self.master.update)
        try:
            r = subprocess.run(
                [py, "-m", "pip", "install", "-r", "requirements.txt"],
                cwd=self.API_DIR,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
            )
            if r.returncode != 0:
                raise RuntimeError(r.stderr)
            self.master.after(
                0, lambda: self.api_loading.config(text="✔ Dependências OK")
            )
        except Exception as e:
            self.master.after(
                0, lambda: messagebox.showerror("Erro", f"pip install:\n{e}")
            )
            self.master.after(0, self.enable_buttons)
            return

        # iniciar uvicorn
        self.master.after(0, lambda: self.api_loading.config(text=""))
        cmd = [py, "-m", "uvicorn", "main:app"]
        flags = {"cwd": self.API_DIR}
        if platform.system() == "Windows":
            flags["creationflags"] = subprocess.CREATE_NEW_PROCESS_GROUP
        else:
            flags["preexec_fn"] = os.setsid

        proc = subprocess.Popen(cmd, **flags)
        self.api_process = proc
        self.master.after(
            0, lambda: messagebox.showinfo("Sucesso", f"FastAPI PID {proc.pid}")
        )
        self.master.after(0, self.update_api_status_label)
        self.master.after(0, self.enable_buttons)

    def start_api(self):
        if self.api_process and self.api_process.poll() is None:
            messagebox.showinfo("Info", "FastAPI já rodando.")
            return
        threading.Thread(target=self._start_api_thread, daemon=True).start()

    def stop_api(self):
        stopped = False
        if self.api_process and self.api_process.poll() is None:
            pid = self.api_process.pid
            try:
                if platform.system() == "Windows":
                    subprocess.call(["taskkill", "/F", "/T", "/PID", str(pid)])
                else:
                    os.killpg(os.getpgid(pid), signal.SIGTERM)
                self.api_process.wait()
                stopped = True
            except:
                pass
        if not stopped and psutil:
            for p in psutil.process_iter():
                try:
                    for c in p.connections(kind="inet"):
                        if c.laddr and c.laddr.port == self.API_PORT:
                            p.kill()
                            stopped = True
                            break
                except:
                    pass
                if stopped:
                    break
        messagebox.showinfo(
            "Resultado", "FastAPI parada." if stopped else "Não encontrada."
        )
        self.update_api_status_label()

    def status_api(self):
        active = self.api_process and self.api_process.poll() is None
        messagebox.showinfo("Status FastAPI", "Ativa" if active else "Inativa")
        self.update_api_status_label()

    def update_api_status_label(self):
        active = self.api_process and self.api_process.poll() is None
        color = "green" if active else "red"
        text = f"Status: {'Ativa' if active else 'Inativa'}"
        self.api_status_label.config(text=text, foreground=color)

    def open_api(self):
        webbrowser.open(f"http://localhost:{self.API_PORT}")

    # ─── Next.js ────────────────────────────────────────────────────────────────

    def _start_next_thread(self):
        # npm install
        self.master.after(0, self.disable_buttons)
        self.master.after(0, lambda: self.next_loading.config(text="🔄 npm install..."))
        self.master.after(0, self.master.update)
        try:
            r = subprocess.run(
                [
                    "npm.cmd" if platform.system() == "Windows" else "npm",
                    "install",
                    "--legacy-peer-deps",
                ],
                cwd=self.NEXT_DIR,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
            )
            if r.returncode != 0:
                raise RuntimeError(r.stderr)
            self.master.after(0, lambda: self.next_loading.config(text="✔ Pacotes OK"))
        except Exception as e:
            self.master.after(
                0, lambda: messagebox.showerror("Erro", f"npm install:\n{e}")
            )
            self.master.after(0, self.enable_buttons)
            return

        # build se necessário
        build_id = os.path.join(self.NEXT_DIR, ".next", "BUILD_ID")
        if not os.path.exists(build_id):
            self.master.after(
                0, lambda: self.next_loading.config(text="🔄 next build...")
            )
            self.master.after(0, self.master.update)
            try:
                r = subprocess.run(
                    [
                        "npm.cmd" if platform.system() == "Windows" else "npm",
                        "run",
                        "build",
                    ],
                    cwd=self.NEXT_DIR,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    text=True,
                )
                if r.returncode != 0:
                    raise RuntimeError(r.stderr)
                self.master.after(
                    0, lambda: self.next_loading.config(text="✔ Build OK")
                )
            except Exception as e:
                self.master.after(
                    0, lambda: messagebox.showerror("Erro", f"next build:\n{e}")
                )
                self.master.after(0, self.enable_buttons)
                return

        # start
        self.master.after(0, lambda: self.next_loading.config(text=""))
        cmd = ["npm.cmd" if platform.system() == "Windows" else "npm", "run", "start"]
        flags = {"cwd": self.NEXT_DIR}
        if platform.system() == "Windows":
            flags["creationflags"] = subprocess.CREATE_NEW_PROCESS_GROUP
        else:
            flags["preexec_fn"] = os.setsid

        proc = subprocess.Popen(cmd, **flags)
        self.next_process = proc
        self.master.after(
            0, lambda: messagebox.showinfo("Sucesso", f"Next.js PID {proc.pid}")
        )
        self.master.after(0, self.update_next_status_label)
        self.master.after(0, self.enable_buttons)

    def start_next(self):
        if self.next_process and self.next_process.poll() is None:
            messagebox.showinfo("Info", "Next.js já rodando.")
            return
        threading.Thread(target=self._start_next_thread, daemon=True).start()

    def stop_next(self):
        stopped = False
        if self.next_process and self.next_process.poll() is None:
            pid = self.next_process.pid
            try:
                if platform.system() == "Windows":
                    subprocess.call(["taskkill", "/F", "/T", "/PID", str(pid)])
                else:
                    os.killpg(os.getpgid(pid), signal.SIGTERM)
                self.next_process.wait()
                stopped = True
            except:
                pass
        if not stopped and psutil:
            for p in psutil.process_iter():
                try:
                    for c in p.connections(kind="inet"):
                        if c.laddr and c.laddr.port == self.NEXT_PORT:
                            p.kill()
                            stopped = True
                            break
                except:
                    pass
                if stopped:
                    break
        messagebox.showinfo(
            "Resultado", "Next.js parada." if stopped else "Não encontrada."
        )
        self.update_next_status_label()

    def status_next(self):
        active = self.next_process and self.next_process.poll() is None
        messagebox.showinfo("Status Next.js", "Ativa" if active else "Inativa")
        self.update_next_status_label()

    def update_next_status_label(self):
        active = self.next_process and self.next_process.poll() is None
        color = "green" if active else "red"
        text = f"Status: {'Ativa' if active else 'Inativa'}"
        self.next_status_label.config(text=text, foreground=color)

    def open_next(self):
        webbrowser.open(f"http://localhost:{self.NEXT_PORT}")

    def on_close(self):
        if messagebox.askyesno("Sair", "Parar apps antes de fechar?"):
            self.stop_api()
            self.stop_next()
        self.master.destroy()


if __name__ == "__main__":
    root = tk.Tk()
    app = ControllerGUI(root)
    root.protocol("WM_DELETE_WINDOW", app.on_close)
    root.mainloop()
