<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $email = 'admin@moveis-soares.test';
        $password = 'Admin@123!';

        User::updateOrCreate(
            ['email' => $email],
            ['name' => 'Administrador Móveis Soares', 'password' => Hash::make($password)]
        );

        $this->command->info("Admin seedado: {$email} / {$password}");
    }
}
