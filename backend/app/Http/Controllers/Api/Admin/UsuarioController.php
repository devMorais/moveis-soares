<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Suporte\Helpers;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UsuarioController extends Controller
{
    private const PAPEIS_VALIDOS = ['admin', 'atendente'];

    public function index(): JsonResponse
    {
        $usuarios = User::orderBy('name')
            ->get()
            ->map(fn (User $u) => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'role' => $u->role,
                'criadoEm' => $u->created_at,
            ]);

        return response()->json($usuarios);
    }

    public function store(Request $request): JsonResponse
    {
        $dados = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'role' => ['required', 'string', Rule::in(self::PAPEIS_VALIDOS)],
        ]);

        $usuario = User::create([
            'name' => $dados['name'],
            'email' => $dados['email'],
            'password' => Hash::make($dados['password']),
            'role' => $dados['role'],
        ]);

        return response()->json([
            'id' => $usuario->id,
            'name' => $usuario->name,
            'email' => $usuario->email,
            'role' => $usuario->role,
            'criadoEm' => $usuario->created_at,
        ], 201);
    }

    public function update(int $id, Request $request): JsonResponse
    {
        $usuario = User::findOrFail($id);

        $dados = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($usuario->id)],
            'password' => ['nullable', 'string', 'min:8'],
            'role' => ['required', 'string', Rule::in(self::PAPEIS_VALIDOS)],
        ]);

        if ($usuario->role === 'admin' && $dados['role'] !== 'admin' && $this->totalAdmins() <= 1) {
            return response()->json(
                Helpers::mensagemErro('Não é possível rebaixar o último administrador do painel.'),
                422
            );
        }

        $usuario->name = $dados['name'];
        $usuario->email = $dados['email'];
        $usuario->role = $dados['role'];

        if (! empty($dados['password'])) {
            $usuario->password = Hash::make($dados['password']);
        }

        $usuario->save();

        return response()->json([
            'id' => $usuario->id,
            'name' => $usuario->name,
            'email' => $usuario->email,
            'role' => $usuario->role,
            'criadoEm' => $usuario->created_at,
        ]);
    }

    public function destroy(int $id, Request $request): JsonResponse
    {
        if ($id === $request->user()->id) {
            return response()->json(
                Helpers::mensagemErro('Você não pode remover a própria conta.'),
                422
            );
        }

        $usuario = User::findOrFail($id);

        if ($usuario->role === 'admin' && $this->totalAdmins() <= 1) {
            return response()->json(
                Helpers::mensagemErro('Não é possível remover o último administrador do painel.'),
                422
            );
        }

        $usuario->delete();

        return response()->json(Helpers::mensagemSucesso('Usuário removido.'));
    }

    private function totalAdmins(): int
    {
        return User::where('role', 'admin')->count();
    }
}
