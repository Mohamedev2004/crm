<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Newsletter;
use App\Models\Notification;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;
use App\Exports\NewslettersExport;
use Maatwebsite\Excel\Facades\Excel;

class NewsletterController extends Controller
{

    /**
     * Affiche la liste des newsletters avec filtres, recherche et pagination.
     */
    public function index(Request $request)
    {
        // Colonnes autorisées pour le tri
        $sortable = ['id', 'email', 'created_at'];

        // Filtres
        $search   = $request->input('search');
        $trashed  = $request->input('trashed'); // all | with | only | null
        $sortBy   = in_array($request->input('sortBy'), $sortable)
                        ? $request->input('sortBy')
                        : 'created_at';
        $sortDir  = $request->input('sortDir') === 'asc' ? 'asc' : 'desc';
        $perPage  = in_array((int)$request->input('perPage'), [5,10,20,30,50])
                        ? (int)$request->input('perPage')
                        : 10;

        // Requête
        $query = Newsletter::query();

        // Filtre pour les soft deletes
        switch ($trashed) {
            case 'all':
            case null:
                $query->withTrashed(); // afficher actifs + désabonnés
                break;
            case 'subscribed': // uniquement actifs
                // pas d'action nécessaire, par défaut
                break;
            case 'unsubscribed': // uniquement soft-deleted
                $query->onlyTrashed();
                break;
        }

        // Recherche par email
        if (!empty($search)) {
            $query->where('email', 'like', "%{$search}%");
        }

        // Tri
        $query->orderBy($sortBy, $sortDir);

        // Pagination
        $newsletters = $query
            ->paginate($perPage)
            ->appends($request->query());

        return Inertia::render('user/newsletters', [
            'newsletters' => $newsletters,
            'filters' => [
                'search'  => $search,
                'trashed' => $trashed,
                'sortBy'  => $sortBy,
                'sortDir' => $sortDir,
                'perPage' => $perPage,
            ],
        ]);
    }

    /**
     * Enregistre une nouvelle newsletter.
     */
    public function store(Request $request)
    {
        // Validation de l'email
        $validated = $request->validate([
            'email' => 'required|email|unique:newsletters,email',
        ]);

        try {
            // Création de la newsletter
            $newsletter = Newsletter::create($validated);

            // Crée une notification seulement si la newsletter est sauvegardée
            if ($newsletter) {
                Notification::create([
                    'title'   => 'Nouvelle inscription à la newsletter',
                    'message' => "Un nouvel utilisateur s'est inscrit avec l'email : {$newsletter->email}",
                    'type'    => 'info',
                ]);

                return back()->with('success', 'Newsletter ajoutée avec succès !');
            } 

            return back()->with('error', 'Échec de l\'ajout de la newsletter.');

        } catch (\Exception $e) {
            Log::error("Erreur lors de l'ajout de l'email à la newsletter : " . $e->getMessage());
            return back()->with('error', 'Une erreur est survenue, veuillez réessayer.');
        }
    }

    /**
     * Met à jour une newsletter existante.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Request $request, $id)
    {
        // Validation
        $request->validate([
            'email' => 'required|email|unique:newsletters,email,' . $id . ',id',
        ]);

        // Récupère la newsletter
        $contact = Newsletter::findOrFail($id);

        // Mise à jour
        $contact->update([
            'email' => $request->email,
        ]);

        return redirect()->back()->with('success', 'Newsletter mise à jour avec succès !');
    }

    /**
     * Supprime une newsletter.
     *
     * @param  int  $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy($id)
    {
        $contact = Newsletter::findOrFail($id);
        $contact->delete();
        return redirect()->back()->with('success', 'Newsletter supprimée avec succès !');
    }

    /**
     * Supprime plusieurs newsletters.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function bulkDelete(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:newsletters,id',
        ]);

        Newsletter::whereIn('id', $request->input('ids'))->delete();

        return back()->with('success', 'Les newsletters sélectionnées ont été supprimées avec succès.');
    }

    /**
     * Restaure une newsletter supprimée.
     *
     * @param  int  $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function restore($id)
    {
        $contact = Newsletter::withTrashed()->findOrFail($id);

        if ($contact->trashed()) {
            $contact->restore();
            return back()->with('success', 'Newsletter restaurée avec succès.');
        }

        return back()->with('error', 'La newsletter n\'est pas supprimée.');
    }

    /**
     * Restaure toutes les newsletters supprimées.
     *
     * @return \Illuminate\Http\RedirectResponse
     */
    public function restoreAll()
    {
        Newsletter::onlyTrashed()->restore();

        return back()->with('success', 'Toutes les newsletters ont été restaurées avec succès.');
    }

    public function export()
    {
        return Excel::download(new NewslettersExport, 'newsletters.xlsx');
    }
}
